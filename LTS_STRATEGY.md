# Long Term Support (LTS) Strategy

## Overview

This document defines the Long Term Support (LTS) strategy for **ngxsmk-gatekeeper**, including supported Angular versions, upgrade guarantees, deprecation policy, and versioning rules.

## Supported Angular Versions

### Current Support Matrix

| Angular Version | Status | Support Level | End of Support |
|----------------|--------|---------------|----------------|
| Angular 17.x | ✅ **LTS** | Full Support | 6 months after Angular 19 LTS ends |
| Angular 18.x | ✅ **Active** | Full Support | 6 months after Angular 20 LTS ends |
| Angular 19.x | ✅ **Active** | Full Support | 6 months after Angular 21 LTS ends |
| Angular 20.x | ✅ **Active** | Full Support | 6 months after Angular 22 LTS ends |
| Angular 21.x+ | ✅ **Active** | Full Support | 6 months after next LTS ends |

### Support Levels

#### **LTS (Long Term Support)**
- **Duration**: Minimum 12 months from Angular's LTS release
- **Updates**: Security patches and critical bug fixes
- **Breaking Changes**: None (patch versions only)
- **New Features**: None (stability-focused)

#### **Active Support**
- **Duration**: Until 6 months after the next Angular LTS release
- **Updates**: All updates including new features and improvements
- **Breaking Changes**: Only in major versions (following semver)
- **New Features**: Regular feature additions

### Minimum Supported Version

**Current Minimum**: Angular 17.0.0

The minimum supported version is updated based on:
- Angular's LTS schedule
- Usage statistics
- Breaking changes in Angular
- Maintenance burden

**Update Policy**: The minimum supported version is updated with at least **6 months notice** before dropping support.

## Upgrade Guarantees

### Major Version Upgrades (x.0.0)

**Guarantee**: Breaking changes are clearly documented and migration guides are provided.

**Timeline**:
- **Announcement**: At least 3 months before release
- **Deprecation Warnings**: Added in previous minor version
- **Migration Guide**: Published with release
- **Support Period**: Previous major version supported for 6 months after new release

**Example**:
- Version 2.0.0 announced in January
- Deprecation warnings added in 1.x versions
- Version 2.0.0 released in April
- Version 1.x supported until October

### Minor Version Upgrades (x.y.0)

**Guarantee**: Backward compatible - no breaking changes.

**Timeline**:
- **New Features**: Added regularly
- **Breaking Changes**: None
- **Deprecation Warnings**: Added for features to be removed in next major version

### Patch Version Upgrades (x.y.z)

**Guarantee**: Bug fixes and security patches only - fully backward compatible.

**Timeline**:
- **Bug Fixes**: Released as needed
- **Security Patches**: Released within 48 hours of discovery
- **Breaking Changes**: Never

## Deprecation Policy

### Deprecation Timeline

1. **Deprecation Announcement** (Minor version)
   - Feature marked as deprecated
   - Deprecation warnings in console (development mode)
   - Documentation updated with deprecation notice
   - Migration path documented

2. **Deprecation Period** (6-12 months)
   - Feature continues to work
   - Warnings remain active
   - Migration guide available
   - Support for migration provided

3. **Removal** (Next major version)
   - Feature removed
   - Breaking change documented
   - Migration guide updated

### Deprecation Examples

#### Example 1: API Change
```
v1.5.0: Deprecation announced
  - Old API: createMiddleware(name, handler)
  - New API: createMiddleware({ name, handler })
  - Console warning: "createMiddleware(name, handler) is deprecated. Use createMiddleware({ name, handler }) instead."

v1.x: Deprecation period (6-12 months)
  - Both APIs work
  - Warnings continue

v2.0.0: Old API removed
  - Only new API available
  - Migration guide provided
```

#### Example 2: Feature Removal
```
v1.8.0: Feature deprecated
  - Feature: Class-based guards
  - Replacement: Functional guards
  - Migration guide published

v1.x: Deprecation period
  - Class-based guards still work
  - Warnings in development

v2.0.0: Feature removed
  - Only functional guards supported
```

## Versioning Rules

### Semantic Versioning (Semver)

We follow [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR** (x.0.0): Breaking changes
- **MINOR** (x.y.0): New features, backward compatible
- **PATCH** (x.y.z): Bug fixes, backward compatible

### Version Number Format

```
MAJOR.MINOR.PATCH[-prerelease][+build]
```

**Examples**:
- `1.0.0` - Initial release
- `1.1.0` - New features
- `1.1.1` - Bug fix
- `2.0.0-beta.1` - Pre-release
- `1.2.0+20240101` - Build metadata

### Versioning Guidelines

#### Major Version (x.0.0)
**When to increment**:
- Breaking API changes
- Removal of deprecated features
- Angular major version requirement change
- Significant architectural changes

**Requirements**:
- Migration guide required
- Deprecation period completed
- Clear breaking changes documentation

#### Minor Version (x.y.0)
**When to increment**:
- New features added
- New middleware examples
- New configuration options
- Performance improvements
- New export formats

**Requirements**:
- Backward compatible
- Deprecation warnings for future breaking changes
- Documentation updated

#### Patch Version (x.y.z)
**When to increment**:
- Bug fixes
- Security patches
- Documentation fixes
- Type definition updates
- Performance optimizations

**Requirements**:
- Fully backward compatible
- No new features
- No breaking changes

## Angular Version Compatibility

### Compatibility Strategy

1. **Forward Compatibility**: Library designed to work with future Angular versions without changes
2. **Backward Compatibility**: Support for multiple Angular versions simultaneously
3. **API Stability**: Use only public, stable Angular APIs
4. **No Angular Internals**: Never rely on private Angular APIs

### Angular Version Support Policy

- **New Angular Versions**: Support added within 30 days of Angular release
- **Old Angular Versions**: Dropped 6 months after Angular's end of support
- **LTS Versions**: Supported for full Angular LTS period + 6 months

### Testing Strategy

- **CI/CD**: Tests run against all supported Angular versions
- **Compatibility Matrix**: Updated with each release
- **Regression Testing**: Full test suite for each supported version

## Release Schedule

### Regular Releases

- **Major**: As needed (breaking changes)
- **Minor**: Every 2-3 months (new features)
- **Patch**: As needed (bug fixes, security)

### Release Process

1. **Development**: Features developed in feature branches
2. **Testing**: Comprehensive testing across supported Angular versions
3. **Documentation**: Updated with changes
4. **Release Notes**: Changelog updated
5. **Publishing**: Released to npm
6. **Announcement**: Release notes published

## Support and Maintenance

### Support Periods

| Version Type | Support Duration |
|-------------|------------------|
| Latest Major | Full support (active development) |
| Previous Major | 6 months after new major release |
| LTS Versions | Full Angular LTS period + 6 months |

### Maintenance Commitments

- **Security Patches**: Released within 48 hours
- **Critical Bugs**: Fixed within 1 week
- **Regular Bugs**: Fixed in next patch/minor release
- **Feature Requests**: Evaluated for next minor/major release

## Migration Support

### Migration Resources

- **Migration Guides**: Provided for all major version upgrades
- **Deprecation Warnings**: Clear warnings in development mode
- **Code Modifications**: Automated migration tools when possible
- **Support**: Help available via GitHub issues

### Migration Timeline

- **Announcement**: 3+ months before breaking change
- **Deprecation Period**: 6-12 months
- **Migration Guide**: Published with deprecation
- **Support**: Available throughout migration period

## Breaking Changes Policy

### What Constitutes a Breaking Change

- API signature changes
- Removal of public APIs
- Behavior changes that break existing code
- Angular version requirement changes
- Type definition changes that break TypeScript compilation

### What Does NOT Constitute a Breaking Change

- Internal implementation changes
- Performance improvements
- New optional parameters
- New features (additive only)
- Bug fixes that restore intended behavior

## Long-Term Compatibility Strategy

### Design Principles

1. **Public APIs Only**: Use only public, stable Angular APIs
2. **Functional Patterns**: Prefer functional guards/interceptors
3. **Standalone Architecture**: No NgModule dependencies
4. **Framework-Agnostic Core**: Core logic independent of Angular
5. **Type Safety**: Full TypeScript support

### Future-Proofing

- **No Angular Internals**: Never rely on private APIs
- **Stable Patterns**: Use patterns that Angular commits to long-term
- **Abstraction Layers**: Abstract Angular-specific code
- **Version Detection**: Graceful handling of version differences

## Version History

### Current Version: 0.0.1 (Development)

- Initial development
- Core middleware engine
- Angular 17+ support
- Basic features implemented

### Planned Versions

- **1.0.0**: First stable release (target: Q2 2024)
- **2.0.0**: Major features and improvements (target: Q4 2024)

## Questions and Support

For questions about versioning, deprecations, or upgrades:

- **GitHub Issues**: [Create an issue](https://github.com/your-username/ngxsmk-gatekeeper/issues)
- **Documentation**: See [README.md](./README.md) for usage
- **Migration Guides**: Check version-specific migration guides

## Summary

**ngxsmk-gatekeeper** is committed to:

✅ **Stability**: Long-term support for Angular LTS versions  
✅ **Compatibility**: Support for multiple Angular versions simultaneously  
✅ **Transparency**: Clear deprecation and migration policies  
✅ **Support**: Helpful migration guides and support resources  
✅ **Predictability**: Semantic versioning and clear release schedule  

This LTS strategy ensures that **ngxsmk-gatekeeper** remains a reliable, long-term solution for Angular applications while adapting to Angular's evolution.

