/**
 * eslint-rules/no-unsafe-default.js
 *
 * Disallow || for default values - use ?? instead.
 * Covers:
 * - JSX props: value={x || default}
 * - Value assignments: const y = z || default
 *
 * ❌ Forbidden:  value={x || default}  |  const y = z || 0
 * ✅ Required:   value={x ?? default}  |  const y = z ?? 0
 *
 * ⚠️ PARSE FUNCTIONS: Do NOT autofix parseFloat/parseInt - they need
 * safeParseFloat/safeParseInt instead (because NaN ?? 0 still = NaN).
 */

"use strict";

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow || for default values - use ?? instead to preserve 0/false/empty",
    },
    fixable: "code",
    schema: [],
    messages: {
      useNullishCoalescing:
        "Use '??' (nullish coalescing) instead of '||' (logical OR) to avoid bugs with falsy values (0, '', false).",
      useSafeParse:
        "Use safeParseFloat() or safeParseInt() from '@/lib/forms/parse' instead. Plain parseFloat/parseInt returns NaN for invalid input, and NaN ?? 0 still equals NaN.",
    },
  },
  create(context) {
    return {
      LogicalExpression(node) {
        if (node.operator !== "||") return;

        const sourceCode = context.sourceCode || context.getSourceCode();
        const isParseCall = isInsideParseCall(node, sourceCode);

        if (isParseCall) {
          context.report({
            node,
            messageId: "useSafeParse",
          });
          return;
        }

        const isJsxAttr = isInsideJsxAttribute(node);
        const isAssignment = isValueAssignment(node);

        if (isJsxAttr || isAssignment) {
          context.report({
            node,
            messageId: "useNullishCoalescing",
            fix(fixer) {
              return fixer.replaceText(node, `${sourceCode.getText(node.left)} ?? ${sourceCode.getText(node.right)}`);
            },
          });
        }
      },
    };
  },
};

function isInsideJsxAttribute(node) {
  let current = node.parent;
  while (current) {
    if (current.type === "JSXAttribute") {
      const valueNode = current.value;
      if (valueNode && valueNode.type === "JSXExpressionContainer") {
        return valueNode.expression === node || valueNode.expression === node.parent;
      }
    }
    if (current.type === "JSXElement" || current.type === "JSXFragment") {
      break;
    }
    current = current.parent;
  }
  return false;
}

function isValueAssignment(node) {
  const parent = node.parent;
  if (!parent) return false;

  if (parent.type === "VariableDeclarator" && parent.init === node) {
    return true;
  }

  if (parent.type === "AssignmentExpression" && parent.left.type === "Identifier") {
    return true;
  }

  if (parent.type === "Property" && parent.value === node) {
    return true;
  }

  return false;
}

function isInsideParseCall(node, sourceCode) {
  let current = node;
  while (current) {
    if (current.type === "CallExpression" && current.callee) {
      const funcName = sourceCode.getText(current.callee);
      if (/^(parseFloat|parseInt|Number)\(/.test(funcName)) {
        return true;
      }
    }
    current = current.parent;
  }
  return false;
}