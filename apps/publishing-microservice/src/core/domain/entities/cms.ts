import { ArgumentError } from '../errors/argument.error';

export abstract class Cms {
  constructor(
    private readonly _id: string,
    private readonly _lastPublishedAt: Date | null,
    private readonly _isActive: boolean,
  ) {
    if (!_id || _id.trim() === '') {
      throw new ArgumentError('Cms id cannot be empty');
    }
  }

  get id(): string {
    return this._id;
  }

  get lastPublishedAt(): Date | null {
    return this._lastPublishedAt;
  }

  get isActive(): boolean {
    return this._isActive;
  }
}

export class WordpressCms extends Cms {
  constructor(
    id: string,
    lastPublishedAt: Date | null,
    isActive: boolean,
    private readonly _baseUrl: string,
    private readonly _username: string,
    private readonly _credentialsRef: string,
  ) {
    super(id, lastPublishedAt, isActive);

    if (!_baseUrl || _baseUrl.trim() === '') {
      throw new ArgumentError('WordpressCms baseUrl cannot be empty');
    }
    if (!_username || _username.trim() === '') {
      throw new ArgumentError('WordpressCms username cannot be empty');
    }
    if (!_credentialsRef || _credentialsRef.trim() === '') {
      throw new ArgumentError(
        'WordpressCms credentialsRef cannot be empty',
      );
    }
  }

  get baseUrl(): string {
    return this._baseUrl;
  }

  get username(): string {
    return this._username;
  }

  get credentialsRef(): string {
    return this._credentialsRef;
  }
}
