function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function openAIEnvelope(model: string, content: string, finishReason = "stop", usage?: any) {
  return { id: `chatcmpl-${crypto.randomUUID()}`, object: "chat.completion", created: Math.floor(Date.now()/1000), model, choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: finishReason }], ...(usage ? { usage } : {}) };
}

export async function normalizeAnthropic(response: Response, model: string) {
  const text = await response.text();
  if (!response.ok) return new Response(text, { status: response.status, headers: { "content-type": "application/json" } });
  const j = JSON.parse(text);
  const content = Array.isArray(j.content) ? j.content.filter((x:any)=>x.type === "text").map((x:any)=>x.text).join("") : "";
  const usage = j.usage ? { prompt_tokens: j.usage.input_tokens || 0, completion_tokens: j.usage.output_tokens || 0, total_tokens: (j.usage.input_tokens || 0)+(j.usage.output_tokens || 0) } : undefined;
  return jsonResponse(openAIEnvelope(model, content, j.stop_reason === "max_tokens" ? "length" : "stop", usage), response.status);
}

export async function normalizeGemini(response: Response, model: string) {
  const text = await response.text();
  if (!response.ok) return new Response(text, { status: response.status, headers: { "content-type": "application/json" } });
  const j = JSON.parse(text);
  const content = (j.candidates?.[0]?.content?.parts || []).map((p:any)=>p.text || "").join("");
  const usage = j.usageMetadata ? { prompt_tokens: j.usageMetadata.promptTokenCount || 0, completion_tokens: j.usageMetadata.candidatesTokenCount || 0, total_tokens: j.usageMetadata.totalTokenCount || 0 } : undefined;
  return jsonResponse(openAIEnvelope(model, content, "stop", usage), response.status);
}

export function normalizeStreamFromSSE(response: Response, model: string, parser: (data:any)=>{text?:string;finish?:string;usage?:any}|null) {
  if (!response.body || !response.ok) return response;
  const decoder = new TextDecoder(); const encoder = new TextEncoder(); let buffer = "";
  const stream = new ReadableStream({ async start(controller) {
    const reader = response.body!.getReader();
    try {
      while (true) {
        const {value,done}=await reader.read(); if(done) break; buffer += decoder.decode(value,{stream:true});
        const events=buffer.split(/\n\n/); buffer=events.pop() || "";
        for(const event of events){const line=event.split("\n").find(x=>x.startsWith("data:")); if(!line) continue; const raw=line.slice(5).trim(); if(!raw||raw==="[DONE]") continue; try{const p=parser(JSON.parse(raw)); if(!p) continue; const chunk={id:`chatcmpl-${model}-${Date.now()}`,object:"chat.completion.chunk",created:Math.floor(Date.now()/1000),model,choices:[{index:0,delta:p.text?{role:"assistant",content:p.text}: {},finish_reason:p.finish||null}],...(p.usage?{usage:p.usage}:{})}; controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));}catch{}}
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n")); controller.close();
    } catch(e){controller.error(e);} finally {reader.releaseLock();}
  }});
  return new Response(stream,{status:response.status,headers:{"content-type":"text/event-stream","cache-control":"no-cache","connection":"keep-alive"}});
}

export function normalizeOllamaStream(response: Response, model: string) {
  if (!response.body || !response.ok) return response;
  const decoder = new TextDecoder(); const encoder = new TextEncoder(); let buffer="";
  const stream=new ReadableStream({async start(controller){const reader=response.body!.getReader();try{while(true){const {value,done}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});const lines=buffer.split("\n");buffer=lines.pop()||"";for(const line of lines){if(!line.trim())continue;try{const j=JSON.parse(line);const content=j.message?.content||"";const finish=j.done?"stop":undefined;const chunk={id:`chatcmpl-${model}-${Date.now()}`,object:"chat.completion.chunk",created:Math.floor(Date.now()/1000),model,choices:[{index:0,delta:content?{role:"assistant",content}:{},finish_reason:finish||null}],...(j.prompt_eval_count||j.eval_count?{usage:{prompt_tokens:j.prompt_eval_count||0,completion_tokens:j.eval_count||0,total_tokens:(j.prompt_eval_count||0)+(j.eval_count||0)}}:{})};controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));}catch{}}}controller.enqueue(encoder.encode("data: [DONE]\n\n"));controller.close();}catch(e){controller.error(e)}finally{reader.releaseLock();}}});
  return new Response(stream,{status:response.status,headers:{"content-type":"text/event-stream","cache-control":"no-cache","connection":"keep-alive"}});
}
