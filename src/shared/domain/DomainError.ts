export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends DomainError {
  readonly code = "VALIDATION_ERROR";

  constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends DomainError {
  readonly code = "NOT_FOUND";

  constructor(message: string) {
    super(message);
  }
}

export class BusinessRuleError extends DomainError {
  readonly code = "BUSINESS_RULE_ERROR";

  constructor(message: string) {
    super(message);
  }
}
