# Custom Conventional Comments Configuration

The Conventional Comments Web Extension now supports custom conventions! You can define your own labels and decorations by placing a `conventional-comments.json` file at the root of your repository.

## How It Works

1. When the extension loads on a GitHub or GitLab page, it checks for a `conventional-comments.json` file at the root of the current repository
2. If found and valid, the extension uses your custom conventions
3. If not found or invalid, the extension falls back to the default conventions

## Configuration File Format

Create a `conventional-comments.json` file at the root of your repository with the following structure:

```json
{
  "labels": [
    {
      "label": "bug",
      "description": "Highlights a bug or defect in the code"
    },
    {
      "label": "feature",
      "description": "Suggests a new feature or enhancement"
    }
  ],
  "decorations": [
    {
      "label": "urgent",
      "description": "This issue needs immediate attention"
    },
    {
      "label": "optional",
      "description": "This change is optional and can be deferred"
    }
  ]
}
```

### Schema

Both `labels` and `decorations` are optional arrays. If you don't specify one, the defaults will be used for that category.

#### Label/Decoration Object

- `label` (string, required): The name of the label or decoration (e.g., "bug", "feature")
- `description` (string, required): A description of when to use this label or decoration

### Rules

1. Both `labels` and `decorations` must be arrays if provided
2. Each item must have both `label` and `description` properties
3. Both properties must be non-empty strings
4. The "none" label is automatically added as the first label option (you don't need to include it)
5. No additional properties are allowed on the configuration object or individual items

## Examples

### Custom Labels Only

```json
{
  "labels": [
    {
      "label": "security",
      "description": "Security-related concern or improvement"
    },
    {
      "label": "performance",
      "description": "Performance optimization suggestion"
    },
    {
      "label": "documentation",
      "description": "Documentation update or improvement"
    }
  ]
}
```

In this case, the extension will use your custom labels but fall back to the default decorations (non-blocking, blocking, if-minor).

### Custom Decorations Only

```json
{
  "decorations": [
    {
      "label": "critical",
      "description": "Critical issue that must be fixed before merge"
    },
    {
      "label": "nice-to-have",
      "description": "Improvement that would be nice but not required"
    }
  ]
}
```

In this case, the extension will use your custom decorations but fall back to the default labels (praise, nitpick, suggestion, etc.).

### Both Custom Labels and Decorations

```json
{
  "labels": [
    {
      "label": "architecture",
      "description": "Architectural design comment"
    },
    {
      "label": "testing",
      "description": "Testing-related comment"
    }
  ],
  "decorations": [
    {
      "label": "must-fix",
      "description": "Must be fixed before approval"
    },
    {
      "label": "consider",
      "description": "Something to consider for the future"
    }
  ]
}
```

## Default Conventions

If no custom configuration is provided, the extension uses the standard conventional comments:

**Default Labels:**
- none
- praise
- nitpick
- suggestion
- issue
- todo
- question
- thought
- chore
- note
- typo
- polish

**Default Decorations:**
- non-blocking
- blocking
- if-minor

See `conventional-comments.json.example` for a complete example with the default conventions.

## Validation

The extension validates your configuration file to ensure it meets the schema requirements. If validation fails, the extension will:
1. Log a warning to the browser console
2. Fall back to the default conventions
3. Cache the negative result to avoid repeated fetch attempts

Common validation errors:
- Invalid JSON syntax
- Missing required properties (`label` or `description`)
- Empty strings for `label` or `description`
- Wrong data types (e.g., arrays instead of objects)
- Additional properties not defined in the schema

## Caching

To improve performance, the extension caches the convention configuration per repository. The cache persists for the duration of the browser session. If you update your `conventional-comments.json` file, you'll need to refresh the page to see the changes.

## Supported Platforms

- GitHub (both classic and new UI)
- GitLab

## File Location

The `conventional-comments.json` file must be located at the root of your repository's default branch (typically `main` or `master`). The extension looks for:

- **GitHub**: `https://raw.githubusercontent.com/{owner}/{repo}/HEAD/conventional-comments.json`
- **GitLab**: `https://gitlab.com/{owner}/{repo}/-/raw/HEAD/conventional-comments.json`
