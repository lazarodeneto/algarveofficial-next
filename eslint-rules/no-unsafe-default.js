/**
 * eslint-rules/no-unsafe-default.js
 *
 * Disallow || for default values in JSX props - use ?? instead.
 */

"use strict";

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow || for default values in JSX props",
    },
    fixable: "code",
    schema: [],
  },
  create(context) {
    return {
      JSXExpressionContainer(node) {
        if (
          node.expression &&
          node.expression.type === "LogicalExpression" &&
          node.expression.operator === "||"
        ) {
          const right = node.expression.right;

          const isLiteral =
            right.type === "Literal" ||
            right.type === "NumericLiteral" ||
            right.type === "StringLiteral" ||
            right.type === "BooleanLiteral" ||
            right.type === "JSXExpressionContainer";

          const canAutofix =
            isLiteral && node.expression.left.type !== "LogicalExpression";

          if (isLiteral) {
            context.report({
              node,
              message:
                "Do not use || for default values. Use ?? instead to preserve 0/false/empty strings.",
              fix(fixer) {
                if (!canAutofix) return null;
                const leftEnd = node.expression.left.range[1];
                const rightStart = node.expression.right.range[0];
                return fixer.replaceTextRange([leftEnd, rightStart], " ?? ");
              },
            });
          }
        }
      },
    };
  },
};