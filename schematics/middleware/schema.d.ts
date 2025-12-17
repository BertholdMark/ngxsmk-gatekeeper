export interface Schema {
  name: string;
  path?: string;
  project?: string;
  type?: 'auth' | 'role' | 'custom';
}

