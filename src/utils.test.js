import { parsePinnedRequirements, mergeParsedRequirements } from './utils.js';

describe('parsePinnedRequirements', () => {
  it('parses single dependency correctly', () => {
    const requirements = `\
        alembic==1.13.1
            # via flask-migrate`;
    expect(parsePinnedRequirements(requirements)).toEqual({
      'flask-migrate': ['alembic'],
    });
  });

  it('groups multiple dependencies under the same via', () => {
    const requirements = `
        alembic==1.13.1
            # via flask-migrate
        async-timeout==4.0.2
            # via flask-migrate
        `;
    expect(parsePinnedRequirements(requirements)).toEqual({
      'flask-migrate': ['alembic', 'async-timeout'],
    });
  });

  it('handles multiple vias for a single dependency', () => {
    const requirements = `
        attrs==23.1.0
            # via
            #   cattrs
            #   jsonschema
        `;
    expect(parsePinnedRequirements(requirements)).toEqual({
      cattrs: ['attrs'],
      jsonschema: ['attrs'],
    });
  });

  it('ignores lines without dependencies or via comments', () => {
    const requirements = `
        alembic==1.13.1
            # via flask-migrate`;
    expect(parsePinnedRequirements(requirements)).toEqual({
      'flask-migrate': ['alembic'],
    });
  });
});

describe('mergeParsedRequirements', () => {
  it('merges non-overlapping keys correctly', () => {
    const obj1 = { 'flask-migrate': ['alembic'] };
    const obj2 = { paramiko: ['bcrypt'] };
    const expected = {
      'flask-migrate': ['alembic'],
      paramiko: ['bcrypt'],
    };
    expect(mergeParsedRequirements(obj1, obj2)).toEqual(expected);
  });

  it('merges overlapping keys with unique dependencies correctly', () => {
    const obj1 = { 'flask-migrate': ['alembic'] };
    const obj2 = { 'flask-migrate': ['async-timeout'], paramiko: ['bcrypt'] };
    const expected = {
      'flask-migrate': ['alembic', 'async-timeout'],
      paramiko: ['bcrypt'],
    };
    expect(mergeParsedRequirements(obj1, obj2)).toEqual(expected);
  });

  it('merges overlapping keys with duplicate dependencies correctly', () => {
    const obj1 = { 'flask-migrate': ['alembic', 'async-timeout'] };
    const obj2 = { 'flask-migrate': ['alembic'], paramiko: ['bcrypt'] };
    const expected = {
      'flask-migrate': ['alembic', 'async-timeout'],
      paramiko: ['bcrypt'],
    };
    expect(mergeParsedRequirements(obj1, obj2)).toEqual(expected);
  });

  it('handles empty objects correctly', () => {
    const obj1 = {};
    const obj2 = { paramiko: ['bcrypt'] };
    const expected = { paramiko: ['bcrypt'] };
    expect(mergeParsedRequirements(obj1, obj2)).toEqual(expected);
  });
});
