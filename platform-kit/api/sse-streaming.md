# مواصفات البث المباشر SSE - راصد الذكي

## المبدأ (API-03, API-04)

الردود تُبث عبر Server-Sent Events (SSE) مع حالات واضحة ودعم fallback.

---

## أنواع الأحداث (Event Types)

### 1. `status` - حالة المعالجة

```
event: status
data: {"type": "status", "status": "understanding", "message": "جارٍ فهم السؤال..."}

event: status
data: {"type": "status", "status": "fetching", "message": "جارٍ جلب بيانات..."}

event: status
data: {"type": "status", "status": "executing", "message": "جارٍ تنفيذ إجراء..."}

event: status
data: {"type": "status", "status": "generating_report", "message": "جارٍ إعداد تقرير..."}

event: status
data: {"type": "status", "status": "generating_chart", "message": "جارٍ إنشاء مخطط..."}
```

### 2. `token` - محتوى الرد

```
event: token
data: {"type": "token", "content": "حالات"}

event: token
data: {"type": "token", "content": " الرصد"}

event: token
data: {"type": "token", "content": " الجديدة"}
```

### 3. `tool_call` - استدعاء أداة (شفافية)

```
event: tool_call
data: {"type": "tool_call", "tool": "query_monitoring_cases", "params": {"status": "حالة رصد", "limit": 10}, "startTime": 1708420800000}

event: tool_result
data: {"type": "tool_result", "tool": "query_monitoring_cases", "summary": "تم جلب 10 حالات رصد", "duration": 230}
```

### 4. `suggestion` - اقتراحات المتابعة

```
event: suggestion
data: {"type": "suggestion", "suggestions": [
  {"text": "أعطني التفاصيل", "action": "details"},
  {"text": "صدّر كتقرير", "action": "export"},
  {"text": "أنشئ مخطط بياني", "action": "chart"}
]}
```

### 5. `navigate` - طلب إذن تنقل

```
event: navigate
data: {"type": "navigate", "targetRoute": "/app/leaks/cases/123", "targetLabel": "تفاصيل حالة الرصد #123", "reason": "لعرض التفاصيل الكاملة"}
```

### 6. `chart` - مخطط بياني

```
event: chart
data: {"type": "chart", "chartId": "chart_abc123", "url": "/api/ai/leaks/charts/chart_abc123", "description": "مخطط اتجاه حالات الرصد - آخر 6 أشهر"}
```

### 7. `done` - انتهاء الرد

```
event: done
data: {"type": "done", "messageId": "msg_123", "tokensUsed": 150, "toolsCalled": 2, "totalDuration": 1200}
```

### 8. `error` - خطأ

```
event: error
data: {"type": "error", "code": "TOOL_FAILURE", "message": "تعذر جلب البيانات. سأحاول تقديم إجابة جزئية.", "recoverable": true}
```

---

## Fallback (API-03)

عند عدم دعم SSE أو فشل الاتصال:

```json
POST /api/ai/:domain/chat?stream=false

Response:
{
  "messageId": "msg_123",
  "content": "النص الكامل للرد...",
  "toolsCalled": [...],
  "suggestions": [...],
  "tokensUsed": 150,
  "duration": 1200
}
```

---

## التنفيذ (TypeScript)

### Server Side

```typescript
// Express SSE handler
app.post('/api/ai/:domain/chat', authenticate, async (req, res) => {
  const { domain } = req.params;
  const { message, conversationId, pageContext } = req.body;
  const stream = req.query.stream !== 'false';

  // Domain guard
  validateDomain(domain, req.user);

  if (stream) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    const emitter = createSSEEmitter(res);

    try {
      emitter.status('understanding', 'جارٍ فهم السؤال...');
      // ... process and stream
      emitter.done({ messageId, tokensUsed, toolsCalled });
    } catch (error) {
      emitter.error('INTERNAL', 'حدث خطأ أثناء المعالجة', true);
    }
  } else {
    // Fallback: non-streaming response
    const result = await processMessage(domain, message, conversationId, pageContext);
    res.json(result);
  }
});
```

### Client Side

```typescript
// React Hook for SSE
function useAIChat(domain: 'leaks' | 'privacy') {
  const [status, setStatus] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const sendMessage = async (message: string, pageContext: PageContext) => {
    const eventSource = new EventSource(
      `/api/ai/${domain}/chat`,
      { /* POST body via fetch */ }
    );

    eventSource.addEventListener('status', (e) => {
      const data = JSON.parse(e.data);
      setStatus(data.message);
    });

    eventSource.addEventListener('token', (e) => {
      const data = JSON.parse(e.data);
      setContent(prev => prev + data.content);
    });

    eventSource.addEventListener('suggestion', (e) => {
      const data = JSON.parse(e.data);
      setSuggestions(data.suggestions);
    });

    eventSource.addEventListener('done', (e) => {
      setStatus('');
      eventSource.close();
    });

    eventSource.addEventListener('error', (e) => {
      // Fallback to non-streaming
      fallbackFetch(domain, message, pageContext);
    });
  };

  return { status, content, suggestions, sendMessage };
}
```

---

## الحالات الواضحة (API-04)

| الحالة | الرسالة العربية | متى تظهر |
|--------|----------------|----------|
| `understanding` | جارٍ فهم السؤال... | بداية المعالجة |
| `fetching` | جارٍ جلب بيانات... | عند استدعاء أداة قراءة |
| `analyzing` | جارٍ التحليل... | عند استدعاء أداة تحليل |
| `executing` | جارٍ تنفيذ إجراء... | عند استدعاء أداة تنفيذ |
| `generating_report` | جارٍ إعداد تقرير... | عند إنشاء تقرير |
| `generating_chart` | جارٍ إنشاء مخطط... | عند إنشاء مخطط بياني |
| `waiting_confirm` | بانتظار تأكيدك... | عند طلب تأكيد إجراء |
