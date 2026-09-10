import { Linter } from "eslint";
import { describe, expect, it } from "vitest";

// Regression test for the eslint.config.mjs "no arithmetic on Money.amount"
// no-restricted-syntax rule — verified directly against the Linter API so
// this doesn't depend on tsconfig project inclusion for a throwaway fixture.
const NO_RESTRICTED_SYNTAX = [
  {
    selector:
      "CallExpression[callee.name=/^(Number|parseFloat|parseInt)$/] MemberExpression[property.name='amount']",
    message: "no-number-coercion-of-money-amount",
  },
  {
    selector: "UnaryExpression[operator='+'] MemberExpression[property.name='amount']",
    message: "no-unary-plus-on-money-amount",
  },
];

function lint(code: string) {
  const linter = new Linter();
  return linter.verify(code, {
    rules: { "no-restricted-syntax": ["error", ...NO_RESTRICTED_SYNTAX] },
  });
}

describe("Money.amount arithmetic ban", () => {
  it("flags Number(money.amount)", () => {
    const messages = lint(
      'const money = { amount: "1.00" };\nconst total = Number(money.amount) + 1;\n',
    );
    expect(messages).toHaveLength(1);
    expect(messages[0]?.message).toContain("no-number-coercion-of-money-amount");
  });

  it("flags parseFloat(money.amount)", () => {
    const messages = lint('const money = { amount: "1.00" };\nparseFloat(money.amount);\n');
    expect(messages).toHaveLength(1);
  });

  it("flags unary + on money.amount", () => {
    const messages = lint('const money = { amount: "1.00" };\nconst total = +money.amount;\n');
    expect(messages).toHaveLength(1);
    expect(messages[0]?.message).toContain("no-unary-plus-on-money-amount");
  });

  it("does not flag unrelated .amount-free code", () => {
    const messages = lint('const total = Number("1") + 1;\n');
    expect(messages).toHaveLength(0);
  });
});
