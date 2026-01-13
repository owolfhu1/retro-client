# Client

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) and upgraded to Angular 18.

## Requirements

- Node.js 22.x.

## Development server

Run `yarn start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Routes

- `/create`: Create a new retro instance.
- `/instance/:id`: Join an existing instance by id (for example, `/instance/demo`).
- `*`: Any other route redirects to `/instance/demo`.

## Code scaffolding

Run `yarn ng generate component component-name` to generate a new component. You can also use `yarn ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `yarn build` to build the project. The build artifacts will be stored in the `dist/` directory. Use `yarn prod` for a production build.

## GitHub Pages deployment

This repo is configured to serve the site from the `master` branch `docs/` folder.

1) Build the production site:
   - `yarn prod` (outputs to `docs/`)
2) Commit and push the updated `docs/` folder.
3) In GitHub repo settings, set Pages source to:
   - Branch: `master`
   - Folder: `/docs`

## Running unit tests

Run `yarn test` to execute the unit tests via [Karma](https://karma-runner.github.io).
