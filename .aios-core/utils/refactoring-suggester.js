const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

/**
 * Automated refactoring suggestion system
 * Analyzes code and suggests refactoring opportunities
 */
class RefactoringSuggester {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.suggestions = [];
    this.refactoringPatterns = new Map();
    this.codeMetrics = new Map();
    this.initializePatterns();
  }

  /**
   * Initialize refactoring patterns
   */
  initializePatterns() {
    // Method extraction pattern
    this.refactoringPatterns.set('extract_method', {
      name: 'Extract Method',
      description: 'Extract long methods into smaller, focused methods',
      detector: this.detectLongMethods.bind(this),
      suggester: this.suggestMethodExtraction.bind(this),
      priority: 'high'
    });

    // Variable extraction pattern
    this.refactoringPatterns.set('extract_variable', {
      name: 'Extract Variable',
      description: 'Extract complex expressions into named variables',
      detector: this.detectComplexExpressions.bind(this),
      suggester: this.suggestVariableExtraction.bind(this),
      priority: 'medium'
    });

    // Parameter object pattern
    this.refactoringPatterns.set('introduce_parameter_object', {
      name: 'Introduce Parameter Object',
      description: 'Group related parameters into an object',
      detector: this.detectLongParameterLists.bind(this),
      suggester: this.suggestParameterObject.bind(this),
      priority: 'medium'
    });

    // Replace conditional with polymorphism
    this.refactoringPatterns.set('replace_conditional', {
      name: 'Replace Conditional with Polymorphism',
      description: 'Replace complex conditionals with polymorphic behavior',
      detector: this.detectComplexConditionals.bind(this),
      suggester: this.suggestPolymorphism.bind(this),
      priority: 'high'
    });

    // Inline temp pattern
    this.refactoringPatterns.set('inline_temp', {
      name: 'Inline Temporary Variable',
      description: 'Replace temporary variables used only once',
      detector: this.detectSingleUseTempVariables.bind(this),
      suggester: this.suggestInlineTemp.bind(this),
      priority: 'low'
    });

    // Remove dead code
    this.refactoringPatterns.set('remove_dead_code', {
      name: 'Remove Dead Code',
      description: 'Remove unreachable or unused code',
      detector: this.detectDeadCode.bind(this),
      suggester: this.suggestDeadCodeRemoval.bind(this),
      priority: 'high'
    });

    // Consolidate duplicate code
    this.refactoringPatterns.set('consolidate_duplicates', {
      name: 'Consolidate Duplicate Code',
      description: 'Extract duplicate code into shared functions',
      detector: this.detectDuplicateCode.bind(this),
      suggester: this.suggestCodeConsolidation.bind(this),
      priority: 'high'
    });

    // Simplify nested conditionals
    this.refactoringPatterns.set('simplify_conditionals', {
      name: 'Simplify Nested Conditionals',
      description: 'Flatten deeply nested if-else chains',
      detector: this.detectNestedConditionals.bind(this),
      suggester: this.suggestConditionalSimplification.bind(this),
      priority: 'medium'
    });

    // Replace magic numbers
    this.refactoringPatterns.set('replace_magic_numbers', {
      name: 'Replace Magic Numbers',
      description: 'Replace hard-coded numbers with named constants',
      detector: this.detectMagicNumbers.bind(this),
      suggester: this.suggestConstantExtraction.bind(this),
      priority: 'low'
    });

    // Decompose complex class
    this.refactoringPatterns.set('decompose_class', {
      name: 'Decompose Complex Class',
      description: 'Split large classes into smaller, focused classes',
      detector: this.detectLargeClasses.bind(this),
      suggester: this.suggestClassDecomposition.bind(this),
      priority: 'high'
    });
  }

  /**
   * Analyze code and suggest refactorings
   */
  async analyzeCode(filePath, options = {}) {
    console.log(chalk.blue(`🔍 Analyzing: ${filePath}`));
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileType = path.extname(filePath);
      
      if (!['.js', '.jsx', '.ts', '.tsx'].includes(fileType)) {
        return {
          filePath,
          suggestions: [],
          error: 'Unsupported file type'
        };
      }

      // Parse code
      const ast = this.parseCode(content, filePath);
      
      // Calculate code metrics
      const metrics = this.calculateCodeMetrics(ast, content);
      this.codeMetrics.set(filePath, metrics);

      // Clear previous suggestions
      this.suggestions = [];

      // Run all refactoring detectors
      for (const [patternId, pattern] of this.refactoringPatterns) {
        if (options.patterns && !options.patterns.includes(patternId)) {
          continue; // Skip if not in requested patterns
        }

        try {
          const detected = await pattern.detector(ast, content, metrics);
          if (detected && detected.length > 0) {
            for (const detection of detected) {
              const suggestion = await pattern.suggester(detection, ast, content);
              if (suggestion) {
                this.suggestions.push({
                  ...suggestion,
                  patternId,
                  pattern: pattern.name,
                  priority: pattern.priority,
                  filePath
                });
              }
            }
          }
        } catch (error) {
          console.warn(chalk.yellow(`Failed to run ${pattern.name}: ${error.message}`));
        }
      }

      // Sort suggestions by priority and impact
      this.suggestions.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return (b.impact || 0) - (a.impact || 0);
      });

      return {
        filePath,
        metrics,
        suggestions: this.suggestions
      };

    } catch (error) {
      return {
        filePath,
        suggestions: [],
        error: error.message
      };
    }
  }

  /**
   * Parse code into AST
   */
  parseCode(content, filePath) {
    const parserOptions = {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript',
        'decorators-legacy',
        'classProperties',
        'asyncGenerators',
        'dynamicImport',
        'optionalChaining',
        'nullishCoalescingOperator'
      ],
      errorRecovery: true
    };

    try {
      return parse(content, parserOptions);
    } catch (error) {
      console.warn(chalk.yellow(`Parse error in ${filePath}: ${error.message}`));
      // Try with more lenient options
      return parse(content, { ...parserOptions, errorRecovery: true });
    }
  }

  /**
   * Calculate code metrics
   */
  calculateCodeMetrics(ast, content) {
    const metrics = {
      lines: content.split('\n').length,
      functions: 0,
      classes: 0,
      complexity: 0,
      maxNesting: 0,
      duplicateBlocks: 0,
      comments: 0,
      imports: 0
    };

    let currentNesting = 0;

    traverse(ast, {
      FunctionDeclaration: () => metrics.functions++,
      FunctionExpression: () => metrics.functions++,
      ArrowFunctionExpression: () => metrics.functions++,
      ClassDeclaration: () => metrics.classes++,
      ImportDeclaration: () => metrics.imports++,
      
      IfStatement: {
        enter: () => {
          metrics.complexity++;
          currentNesting++;
          metrics.maxNesting = Math.max(metrics.maxNesting, currentNesting);
        },
        exit: () => currentNesting--
      },
      
      SwitchStatement: () => metrics.complexity += 2,
      ForStatement: () => metrics.complexity++,
      WhileStatement: () => metrics.complexity++,
      DoWhileStatement: () => metrics.complexity++,
      ConditionalExpression: () => metrics.complexity++,
      LogicalExpression: (path) => {
        if (path.node.operator === '&&' || path.node.operator === '||') {
          metrics.complexity++;
        }
      },
      
      Comment: () => metrics.comments++
    });

    return metrics;
  }

  // Refactoring detectors

  async detectLongMethods(ast, content, metrics) {
    const longMethods = [];
    const methodSizeThreshold = 30; // lines

    traverse(ast, {
      'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression': (path) => {
        const start = path.node.loc.start.line;
        const end = path.node.loc.end.line;
        const methodLines = end - start + 1;

        if (methodLines > methodSizeThreshold) {
          const methodName = this.getMethodName(path);
          longMethods.push({
            type: 'long_method',
            node: path.node,
            path: path,
            name: methodName,
            lines: methodLines,
            startLine: start,
            endLine: end,
            complexity: this.calculateMethodComplexity(path)
          });
        }
      }
    });

    return longMethods;
  }

  async detectComplexExpressions(ast, content, metrics) {
    const complexExpressions = [];
    const complexityThreshold = 3; // nesting/chaining depth

    traverse(ast, {
      Expression: (path) => {
        const complexity = this.calculateExpressionComplexity(path.node);
        if (complexity > complexityThreshold) {
          complexExpressions.push({
            type: 'complex_expression',
            node: path.node,
            path: path,
            complexity: complexity,
            startLine: path.node.loc?.start.line,
            endLine: path.node.loc?.end.line
          });
        }
      }
    });

    return complexExpressions;
  }

  async detectLongParameterLists(ast, content, metrics) {
    const longParameterLists = [];
    const parameterThreshold = 4;

    traverse(ast, {
      'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression': (path) => {
        const params = path.node.params;
        if (params.length > parameterThreshold) {
          const methodName = this.getMethodName(path);
          longParameterLists.push({
            type: 'long_parameter_list',
            node: path.node,
            path: path,
            name: methodName,
            parameterCount: params.length,
            parameters: params.map(p => p.name || 'unknown'),
            startLine: path.node.loc?.start.line
          });
        }
      }
    });

    return longParameterLists;
  }

  async detectComplexConditionals(ast, content, metrics) {
    const complexConditionals = [];
    const branchThreshold = 4;

    traverse(ast, {
      IfStatement: (path) => {
        const branches = this.countConditionalBranches(path);
        if (branches > branchThreshold) {
          complexConditionals.push({
            type: 'complex_conditional',
            node: path.node,
            path: path,
            branches: branches,
            startLine: path.node.loc?.start.line,
            endLine: path.node.loc?.end.line
          });
        }
      },
      
      SwitchStatement: (path) => {
        const cases = path.node.cases.length;
        if (cases > branchThreshold) {
          complexConditionals.push({
            type: 'complex_switch',
            node: path.node,
            path: path,
            cases: cases,
            startLine: path.node.loc?.start.line,
            endLine: path.node.loc?.end.line
          });
        }
      }
    });

    return complexConditionals;
  }

  async detectSingleUseTempVariables(ast, content, metrics) {
    const singleUseVars = [];
    const varUsage = new Map();

    // First pass: collect all variable declarations and usages
    traverse(ast, {
      VariableDeclarator: (path) => {
        if (path.node.id.type === 'Identifier') {
          const varName = path.node.id.name;
          if (!varUsage.has(varName)) {
            varUsage.set(varName, {
              declaration: path,
              uses: []
            });
          }
        }
      },
      
      Identifier: (path) => {
        if (path.isReferencedIdentifier()) {
          const varName = path.node.name;
          if (varUsage.has(varName)) {
            varUsage.get(varName).uses.push(path);
          }
        }
      }
    });

    // Second pass: find single-use variables
    for (const [varName, usage] of varUsage) {
      if (usage.uses.length === 1 && usage.declaration.node.init) {
        singleUseVars.push({
          type: 'single_use_temp',
          name: varName,
          declaration: usage.declaration,
          use: usage.uses[0],
          startLine: usage.declaration.node.loc?.start.line
        });
      }
    }

    return singleUseVars;
  }

  async detectDeadCode(ast, content, metrics) {
    const deadCode = [];

    traverse(ast, {
      // Unreachable code after return/throw
      'ReturnStatement|ThrowStatement': (path) => {
        const parent = path.parent;
        if (parent.type === 'BlockStatement') {
          const siblings = parent.body;
          const currentIndex = siblings.indexOf(path.node);
          
          for (let i = currentIndex + 1; i < siblings.length; i++) {
            deadCode.push({
              type: 'unreachable_code',
              node: siblings[i],
              reason: 'after_return_throw',
              startLine: siblings[i].loc?.start.line
            });
          }
        }
      },
      
      // Unused functions
      FunctionDeclaration: (path) => {
        const functionName = path.node.id?.name;
        if (functionName && !this.isFunctionUsed(functionName, ast)) {
          deadCode.push({
            type: 'unused_function',
            node: path.node,
            name: functionName,
            startLine: path.node.loc?.start.line
          });
        }
      },
      
      // Always false conditions
      IfStatement: (path) => {
        if (path.node.test.type === 'BooleanLiteral' && !path.node.test.value) {
          deadCode.push({
            type: 'dead_branch',
            node: path.node.consequent,
            reason: 'always_false',
            startLine: path.node.loc?.start.line
          });
        }
      }
    });

    return deadCode;
  }

  async detectDuplicateCode(ast, content, metrics) {
    const duplicates = [];
    const codeBlocks = new Map();
    const minBlockSize = 5; // minimum lines for duplicate detection

    traverse(ast, {
      BlockStatement: (path) => {
        if (path.node.body.length >= minBlockSize) {
          const blockHash = this.hashCodeBlock(path.node);
          
          if (codeBlocks.has(blockHash)) {
            const original = codeBlocks.get(blockHash);
            duplicates.push({
              type: 'duplicate_code',
              original: original,
              duplicate: path,
              startLine: path.node.loc?.start.line,
              endLine: path.node.loc?.end.line,
              lines: path.node.loc?.end.line - path.node.loc?.start.line + 1
            });
          } else {
            codeBlocks.set(blockHash, path);
          }
        }
      }
    });

    return duplicates;
  }

  async detectNestedConditionals(ast, content, metrics) {
    const nestedConditionals = [];
    const nestingThreshold = 3;

    const checkNesting = (path, depth = 0) => {
      if (depth > nestingThreshold) {
        nestedConditionals.push({
          type: 'nested_conditional',
          node: path.node,
          path: path,
          depth: depth,
          startLine: path.node.loc?.start.line,
          endLine: path.node.loc?.end.line
        });
      }

      // Check nested ifs
      traverse(path.node, {
        IfStatement: (innerPath) => {
          if (innerPath.node !== path.node) {
            checkNesting(innerPath, depth + 1);
            innerPath.skip();
          }
        }
      }, path.scope, path);
    };

    traverse(ast, {
      IfStatement: (path) => checkNesting(path, 1)
    });

    return nestedConditionals;
  }

  async detectMagicNumbers(ast, content, metrics) {
    const magicNumbers = [];
    const ignoredNumbers = new Set([0, 1, -1, 2, 10, 100, 1000]);

    traverse(ast, {
      NumericLiteral: (path) => {
        const value = path.node.value;
        
        // Skip common/obvious numbers
        if (ignoredNumbers.has(value)) return;
        
        // Skip array indices
        if (path.parent.type === 'MemberExpression' && path.parent.computed) return;
        
        // Skip in constant declarations
        if (path.findParent(p => p.isVariableDeclarator() && 
            p.parent.kind === 'const')) return;

        magicNumbers.push({
          type: 'magic_number',
          node: path.node,
          path: path,
          value: value,
          context: path.parent.type,
          startLine: path.node.loc?.start.line
        });
      }
    });

    return magicNumbers;
  }

  async detectLargeClasses(ast, content, metrics) {
    const largeClasses = [];
    const methodThreshold = 10;
    const propertyThreshold = 15;

    traverse(ast, {
      ClassDeclaration: (path) => {
        const methods = path.node.body.body.filter(m => 
          m.type === 'ClassMethod' || m.type === 'ClassProperty'
        );
        
        const methodCount = methods.filter(m => m.type === 'ClassMethod').length;
        const propertyCount = methods.filter(m => m.type === 'ClassProperty').length;

        if (methodCount > methodThreshold || propertyCount > propertyThreshold) {
          largeClasses.push({
            type: 'large_class',
            node: path.node,
            path: path,
            name: path.node.id?.name,
            methodCount: methodCount,
            propertyCount: propertyCount,
            totalMembers: methods.length,
            startLine: path.node.loc?.start.line,
            endLine: path.node.loc?.end.line
          });
        }
      }
    });

    return largeClasses;
  }

  // Refactoring suggesters

  async suggestMethodExtraction(detection, ast, content) {
    const suggestion = {
      type: 'extract_method',
      description: `Extract method '${detection.name}' (${detection.lines} lines)`,
      location: {
        start: detection.startLine,
        end: detection.endLine
      },
      impact: Math.min(10, Math.floor(detection.lines / 10) + Math.floor(detection.complexity / 5)),
      details: `Method has ${detection.lines} lines and complexity of ${detection.complexity}. Consider extracting logical sections into separate methods.`,
      suggestedRefactoring: this.generateMethodExtractionSuggestion(detection)
    };

    return suggestion;
  }

  async suggestVariableExtraction(detection, ast, content) {
    const suggestion = {
      type: 'extract_variable',
      description: 'Extract complex expression into variable',
      location: {
        start: detection.startLine,
        end: detection.endLine
      },
      impact: Math.min(5, detection.complexity - 2),
      details: `Expression has complexity of ${detection.complexity}. Extract into a named variable for better readability.`,
      suggestedRefactoring: this.generateVariableExtractionSuggestion(detection)
    };

    return suggestion;
  }

  async suggestParameterObject(detection, ast, content) {
    const suggestion = {
      type: 'introduce_parameter_object',
      description: `Group ${detection.parameterCount} parameters in '${detection.name}'`,
      location: {
        start: detection.startLine,
        end: detection.startLine
      },
      impact: Math.min(7, detection.parameterCount - 3),
      details: `Method has ${detection.parameterCount} parameters: ${detection.parameters.join(', ')}. Consider grouping related parameters into an object.`,
      suggestedRefactoring: this.generateParameterObjectSuggestion(detection)
    };

    return suggestion;
  }

  async suggestPolymorphism(detection, ast, content) {
    const suggestion = {
      type: 'replace_conditional',
      description: `Replace ${detection.type === 'complex_switch' ? 'switch' : 'conditional'} with polymorphism`,
      location: {
        start: detection.startLine,
        end: detection.endLine
      },
      impact: Math.min(8, detection.branches || detection.cases),
      details: `Complex ${detection.type === 'complex_switch' ? 'switch' : 'conditional'} with ${detection.branches || detection.cases} branches. Consider using polymorphism or strategy pattern.`,
      suggestedRefactoring: this.generatePolymorphismSuggestion(detection)
    };

    return suggestion;
  }

  async suggestInlineTemp(detection, ast, content) {
    const suggestion = {
      type: 'inline_temp',
      description: `Inline temporary variable '${detection.name}'`,
      location: {
        start: detection.startLine,
        end: detection.startLine
      },
      impact: 2,
      details: `Variable '${detection.name}' is used only once. Consider inlining it.`,
      suggestedRefactoring: this.generateInlineTempSuggestion(detection)
    };

    return suggestion;
  }

  async suggestDeadCodeRemoval(detection, ast, content) {
    const suggestion = {
      type: 'remove_dead_code',
      description: `Remove ${detection.type.replace('_', ' ')}${detection.name ? `: ${detection.name}` : ''}`,
      location: {
        start: detection.startLine,
        end: detection.node.loc?.end.line || detection.startLine
      },
      impact: 5,
      details: `${detection.type === 'unreachable_code' ? 'Code is unreachable' : detection.type === 'unused_function' ? 'Function is never called' : 'Code is dead'}`,
      suggestedRefactoring: {
        action: 'delete',
        lines: [detection.startLine, detection.node.loc?.end.line || detection.startLine]
      }
    };

    return suggestion;
  }

  async suggestCodeConsolidation(detection, ast, content) {
    const suggestion = {
      type: 'consolidate_duplicates',
      description: `Extract duplicate code block (${detection.lines} lines)`,
      location: {
        start: detection.startLine,
        end: detection.endLine
      },
      impact: Math.min(9, detection.lines),
      details: `Found duplicate code block. Extract into a shared function.`,
      suggestedRefactoring: this.generateConsolidationSuggestion(detection)
    };

    return suggestion;
  }

  async suggestConditionalSimplification(detection, ast, content) {
    const suggestion = {
      type: 'simplify_conditionals',
      description: `Simplify nested conditionals (depth: ${detection.depth})`,
      location: {
        start: detection.startLine,
        end: detection.endLine
      },
      impact: Math.min(7, detection.depth * 2),
      details: `Deeply nested conditionals (${detection.depth} levels). Consider early returns or guard clauses.`,
      suggestedRefactoring: this.generateConditionalSimplificationSuggestion(detection)
    };

    return suggestion;
  }

  async suggestConstantExtraction(detection, ast, content) {
    const suggestion = {
      type: 'replace_magic_numbers',
      description: `Replace magic number ${detection.value}`,
      location: {
        start: detection.startLine,
        end: detection.startLine
      },
      impact: 3,
      details: `Magic number ${detection.value} found in ${detection.context}. Extract to named constant.`,
      suggestedRefactoring: this.generateConstantExtractionSuggestion(detection)
    };

    return suggestion;
  }

  async suggestClassDecomposition(detection, ast, content) {
    const suggestion = {
      type: 'decompose_class',
      description: `Decompose large class '${detection.name}' (${detection.totalMembers} members)`,
      location: {
        start: detection.startLine,
        end: detection.endLine
      },
      impact: Math.min(10, Math.floor(detection.totalMembers / 5)),
      details: `Class has ${detection.methodCount} methods and ${detection.propertyCount} properties. Consider splitting into smaller, focused classes.`,
      suggestedRefactoring: this.generateClassDecompositionSuggestion(detection)
    };

    return suggestion;
  }

  // Helper methods

  getMethodName(path) {
    if (path.node.id) {
      return path.node.id.name;
    }
    
    // Check if it's a method in a class
    if (path.parent.type === 'ClassMethod') {
      return path.parent.key.name;
    }
    
    // Check if it's assigned to a variable
    if (path.parent.type === 'VariableDeclarator') {
      return path.parent.id.name;
    }
    
    // Check if it's a property
    if (path.parent.type === 'ObjectProperty') {
      return path.parent.key.name || path.parent.key.value;
    }
    
    return 'anonymous';
  }

  calculateMethodComplexity(path) {
    let complexity = 1;
    
    traverse(path.node, {
      IfStatement: () => complexity++,
      ConditionalExpression: () => complexity++,
      SwitchCase: () => complexity++,
      WhileStatement: () => complexity++,
      ForStatement: () => complexity++,
      DoWhileStatement: () => complexity++,
      LogicalExpression: (innerPath) => {
        if (innerPath.node.operator === '&&' || innerPath.node.operator === '||') {
          complexity++;
        }
      }
    }, path.scope, path);
    
    return complexity;
  }

  calculateExpressionComplexity(node, depth = 0) {
    if (!node) return depth;
    
    let maxDepth = depth;
    
    // Check different expression types
    if (node.type === 'CallExpression') {
      maxDepth = Math.max(maxDepth, this.calculateExpressionComplexity(node.callee, depth + 1));
      for (const arg of node.arguments) {
        maxDepth = Math.max(maxDepth, this.calculateExpressionComplexity(arg, depth + 1));
      }
    } else if (node.type === 'MemberExpression') {
      maxDepth = Math.max(maxDepth, this.calculateExpressionComplexity(node.object, depth + 1));
    } else if (node.type === 'ConditionalExpression') {
      maxDepth = Math.max(maxDepth, 
        this.calculateExpressionComplexity(node.test, depth + 1),
        this.calculateExpressionComplexity(node.consequent, depth + 1),
        this.calculateExpressionComplexity(node.alternate, depth + 1)
      );
    } else if (node.type === 'BinaryExpression' || node.type === 'LogicalExpression') {
      maxDepth = Math.max(maxDepth,
        this.calculateExpressionComplexity(node.left, depth + 1),
        this.calculateExpressionComplexity(node.right, depth + 1)
      );
    }
    
    return maxDepth;
  }

  countConditionalBranches(path) {
    let branches = 1; // Initial if branch
    
    let current = path.node;
    while (current.alternate) {
      branches++;
      if (current.alternate.type === 'IfStatement') {
        current = current.alternate;
      } else {
        break;
      }
    }
    
    return branches;
  }

  isFunctionUsed(functionName, ast) {
    let used = false;
    
    traverse(ast, {
      CallExpression: (path) => {
        if (path.node.callee.type === 'Identifier' && 
            path.node.callee.name === functionName) {
          used = true;
          path.stop();
        }
      },
      Identifier: (path) => {
        if (path.node.name === functionName && 
            path.isReferencedIdentifier() &&
            !path.isFunction()) {
          used = true;
          path.stop();
        }
      }
    });
    
    return used;
  }

  hashCodeBlock(node) {
    // Simple hash based on code structure
    const code = generate(node, { compact: true }).code;
    return code.replace(/\s+/g, ' ').trim();
  }

  // Suggestion generators

  generateMethodExtractionSuggestion(detection) {
    return {
      action: 'extract_method',
      extractedMethods: [
        {
          name: `extracted${detection.name.charAt(0).toUpperCase() + detection.name.slice(1)}Part1`,
          description: 'Extract first logical section',
          suggestedLines: [detection.startLine + 5, detection.startLine + 15]
        },
        {
          name: `extracted${detection.name.charAt(0).toUpperCase() + detection.name.slice(1)}Part2`,
          description: 'Extract second logical section',
          suggestedLines: [detection.startLine + 16, detection.endLine - 5]
        }
      ]
    };
  }

  generateVariableExtractionSuggestion(detection) {
    return {
      action: 'extract_variable',
      variableName: 'extractedExpression',
      insertBefore: detection.startLine
    };
  }

  generateParameterObjectSuggestion(detection) {
    return {
      action: 'introduce_parameter_object',
      objectName: `${detection.name}Options`,
      groupedParameters: detection.parameters.slice(2), // Keep first 2 params separate
      keepParameters: detection.parameters.slice(0, 2)
    };
  }

  generatePolymorphismSuggestion(detection) {
    return {
      action: 'replace_with_polymorphism',
      strategyPattern: true,
      suggestedClasses: ['BaseHandler', 'TypeAHandler', 'TypeBHandler'],
      interfaceMethod: 'handle'
    };
  }

  generateInlineTempSuggestion(detection) {
    return {
      action: 'inline_variable',
      variableName: detection.name,
      declarationLine: detection.declaration.node.loc?.start.line,
      usageLine: detection.use.node.loc?.start.line
    };
  }

  generateConsolidationSuggestion(detection) {
    return {
      action: 'extract_shared_function',
      functionName: 'extractedSharedFunction',
      originalLocations: [
        {
          start: detection.original.node.loc?.start.line,
          end: detection.original.node.loc?.end.line
        },
        {
          start: detection.duplicate.node.loc?.start.line,
          end: detection.duplicate.node.loc?.end.line
        }
      ]
    };
  }

  generateConditionalSimplificationSuggestion(detection) {
    return {
      action: 'simplify_nested_conditionals',
      techniques: ['early_return', 'guard_clauses', 'extract_condition'],
      suggestedStructure: 'Use guard clauses for edge cases and early returns'
    };
  }

  generateConstantExtractionSuggestion(detection) {
    const constantName = this.suggestConstantName(detection.value, detection.context);
    return {
      action: 'extract_constant',
      constantName: constantName,
      value: detection.value,
      scope: 'module' // or 'class' depending on context
    };
  }

  generateClassDecompositionSuggestion(detection) {
    return {
      action: 'decompose_class',
      suggestedClasses: [
        {
          name: `${detection.name}Core`,
          description: 'Core functionality',
          methods: 'Core business logic methods'
        },
        {
          name: `${detection.name}Utils`,
          description: 'Utility methods',
          methods: 'Helper and utility methods'
        },
        {
          name: `${detection.name}Config`,
          description: 'Configuration and setup',
          methods: 'Configuration-related methods'
        }
      ]
    };
  }

  suggestConstantName(value, context) {
    // Generate meaningful constant names based on value and context
    const contextMap = {
      'BinaryExpression': 'THRESHOLD',
      'IfStatement': 'CONDITION',
      'ForStatement': 'LIMIT',
      'CallExpression': 'PARAMETER'
    };
    
    const baseContext = contextMap[context] || 'VALUE';
    return `${baseContext}_${Math.abs(value).toString().replace('.', '_')}`;
  }

  /**
   * Apply refactoring suggestion
   */
  async applySuggestion(suggestion, options = {}) {
    console.log(chalk.blue(`🔧 Applying ${suggestion.type} refactoring...`));
    
    try {
      // This would integrate with the actual refactoring implementation
      // For now, it's a placeholder showing the structure
      
      const result = {
        success: false,
        changes: [],
        error: null
      };

      switch (suggestion.type) {
        case 'extract_method':
          result.changes = await this.applyMethodExtraction(suggestion);
          break;
        case 'extract_variable':
          result.changes = await this.applyVariableExtraction(suggestion);
          break;
        case 'inline_temp':
          result.changes = await this.applyInlineTemp(suggestion);
          break;
        case 'remove_dead_code':
          result.changes = await this.applyDeadCodeRemoval(suggestion);
          break;
        default:
          throw new Error(`Refactoring type ${suggestion.type} not implemented`);
      }

      result.success = true;
      return result;

    } catch (error) {
      console.error(chalk.red(`Failed to apply refactoring: ${error.message}`));
      return {
        success: false,
        changes: [],
        error: error.message
      };
    }
  }

  // Placeholder methods for applying refactorings
  async applyMethodExtraction(suggestion) {
    // Implementation would use AST transformation
    return [{
      type: 'extract_method',
      file: suggestion.filePath,
      description: `Extracted method from lines ${suggestion.location.start}-${suggestion.location.end}`
    }];
  }

  async applyVariableExtraction(suggestion) {
    return [{
      type: 'extract_variable',
      file: suggestion.filePath,
      description: `Extracted variable at line ${suggestion.location.start}`
    }];
  }

  async applyInlineTemp(suggestion) {
    return [{
      type: 'inline_temp',
      file: suggestion.filePath,
      description: `Inlined variable at line ${suggestion.location.start}`
    }];
  }

  async applyDeadCodeRemoval(suggestion) {
    return [{
      type: 'remove_dead_code',
      file: suggestion.filePath,
      description: `Removed dead code at lines ${suggestion.location.start}-${suggestion.location.end}`
    }];
  }

  /**
   * Get refactoring statistics
   */
  getStatistics() {
    const stats = {
      totalSuggestions: this.suggestions.length,
      byType: {},
      byPriority: {
        high: 0,
        medium: 0,
        low: 0
      },
      averageImpact: 0
    };

    let totalImpact = 0;
    
    for (const suggestion of this.suggestions) {
      // By type
      stats.byType[suggestion.type] = (stats.byType[suggestion.type] || 0) + 1;
      
      // By priority
      stats.byPriority[suggestion.priority]++;
      
      // Impact
      totalImpact += suggestion.impact || 0;
    }

    stats.averageImpact = stats.totalSuggestions > 0 ? 
      (totalImpact / stats.totalSuggestions).toFixed(2) : 0;

    return stats;
  }
}

module.exports = RefactoringSuggester;