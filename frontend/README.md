# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

This project uses [Playwright](https://playwright.dev/) for end-to-end testing with [Allure](https://docs.qameta.io/allure/) reporting.

### Run tests

```bash
npm test                              # Run all E2E tests (with Allure)
npm run test:ui                       # Run with Playwright UI
npm run test:headed                   # Run in headed mode (visible browser)
npx playwright test --reporter=list   # Run with simple list reporter
```

### View test reports

**Playwright HTML Report:**
```bash
npm run test:report    # Open Playwright's built-in HTML report
```

**Allure Report (recommended - detailed dashboard):**

**Option 1: Using npm scripts (recommended)**
```bash
npm run allure:generate    # Generate Allure HTML report
npm run allure:open        # Open in browser
```

**Option 2: Using PowerShell helper (Windows)**
```powershell
.\allure-report.ps1        # Auto-fixes JAVA_HOME and opens report
```

**Option 3: Manual commands**
```bash
# Run tests with Allure reporter explicitly
npx playwright test --reporter=allure-playwright

# Generate and open report
npx allure generate ./allure-results --clean -o ./allure-report
npx allure open ./allure-report
```

**Requirements:**
- **Java** is required for Allure (JDK 8 or higher)
- If you get a `JAVA_HOME` error on Windows, use `.\allure-report.ps1` which sets it automatically

**What you get with Allure:**
- 📊 Interactive dashboard with test statistics
- 📸 Screenshots and video recordings
- 🔍 Detailed test execution traces
- 📈 Trends and history (when run multiple times)
- 🏷️ Test categorization and filtering

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
