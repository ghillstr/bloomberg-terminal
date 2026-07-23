import YahooFinanceClass from 'yahoo-finance2';

// yahoo-finance2 v4 requires instantiation with `new YahooFinance()`
// The default export is the class, not an instance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yahooFinance = new (YahooFinanceClass as any)() as typeof YahooFinanceClass.prototype;

export default yahooFinance;
