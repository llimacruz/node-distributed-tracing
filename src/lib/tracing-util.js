const {
  initTracer,
  Span,
  SpanContext
} = require("jaeger-client");

const init = serviceName => {
  const config = {
    serviceName: serviceName,
    sampler: {
      type: "const",
      param: 1,
    },
    reporter: {
      logSpans: true,
    },
  };
  const options = {
    logger: {
      info(msg) {
        // console.log("INFO ", msg);
      },
      error(msg) {
        console.log("ERROR", msg);
      },
    },
  };
  return initTracer(config, options);
};

/**
 * The property "spanData.traceId" reach this point with "data" property when
 * using "tracer.startSpan" without the parent reference.
 * Otherwise the traceId is available at "spanData.traceId".
 * I still haven't figure out the reason.
*/
const createSpan = (tracer, spanData, operationName) => {
  const parentContext = new SpanContext(
    spanData.traceId.data || spanData.traceId,
    spanData.spanId.data);
  const parentSpan = new Span(tracer, null, parentContext);
  const localSpan = tracer.startSpan(operationName, { childOf: parentSpan });
  return localSpan;
}

const buildSpanData = span => {
  return {
    spanId: span.context().spanId,
    spanIdStr: span.context().spanIdStr,
    traceId: span.context().traceId,
    traceIdStr: span.context().traceIdStr
  };
}

module.exports = {
  init,
  createSpan,
  buildSpanData
}
