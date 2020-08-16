export function createPushOnlyArray() {
  const fired: any[] = [];
  return {
    push: (ruleName: any) => fired.push(ruleName),
    get source() {
      return fired;
    },
  };
}
