import { css } from 'styled-components';
import { breakpoints, viewports } from './breakpoints';

// * Start Editing

const flexboxgridBreakpoints = [
  { name: 'xs', viewport: `0px`, container: '100%', containerPadding: '1rem' },
  {
    name: 'sm',
    viewport: `${viewports.tabletS}px`,
    container: '100%',
    containerPadding: '2rem',
  },
  {
    name: 'md',
    viewport: `${viewports.laptopS}px`,
    container: '87.5%',
    containerPadding: '0.625rem',
  },
  {
    name: 'lg',
    viewport: `${viewports.laptopM}px`,
    container: '1720px',
    containerPadding: '5rem',
  },
];

const columns = 12;

const gridVars = () => css`
  :root {
    // Set the number of columns you want to use on your layout.
    --flexboxgrid-grid-columns: ${columns};
    // Set the gutter between columns.
    --flexboxgrid-gutter-width: 0.625rem;
    // Set a margin for the container sides.
    --flexboxgrid-outer-margin: 2rem;

    --flexboxgrid-max-width: 1200px;

    @media ${breakpoints.laptopS} {
      --flexboxgrid-gutter-width: 1.25rem;
    }
  }
`;

// * Stop Editing

const flexboxgridColCommon = `
  box-sizing: border-box;
  flex-grow: 0;
  flex-shrink: 0;
  padding-right: var(--half-gutter-width);
  padding-left: var(--half-gutter-width);
`;

const breakpointsStyles = () => {
  let styles = '';
  for (let i = 0; i < flexboxgridBreakpoints.length; i += 1) {
    const { name, viewport, container, containerPadding } =
      flexboxgridBreakpoints[i];
    const colLoop = () => {
      let colStyles = ``;
      for (let j = 1; j <= columns; j += 1) {
        colStyles += `
          .col-${name}-${j} {
            ${flexboxgridColCommon}
            flex-basis: ${(100 / columns) * j}%;
            max-width: ${(100 / columns) * j}%;
          }
        `;
      }
      return colStyles;
    };
    const colOffsetLoop = () => {
      let colOffsetStyles = ``;
      for (let j = 0; j <= columns; j += 1) {
        if (j === 0) {
          colOffsetStyles += `
          .col-${name}-offset-${j} {
            ${flexboxgridColCommon}
            margin-left: 0;
          }
          `;
        } else {
          colOffsetStyles += `
          .col-${name}-offset-${j} {
            ${flexboxgridColCommon}
            margin-left: ${(100 / columns) * j}%;
          }
        `;
        }
      }
      return colOffsetStyles;
    };
    styles += `
      @media only screen and (min-width: ${viewport}) {
        .container {
          max-width: ${container};
          padding-right: ${containerPadding};
          padding-left: ${containerPadding};
          margin-right: auto;
          margin-left: auto;
        }

        .container-fluid {
          width: 100%;
          padding-right: ${containerPadding};
          padding-left: ${containerPadding};
          margin-right: auto;
          margin-left: auto;
        }
  
        .col-${name} {
          ${flexboxgridColCommon}
          flex-basis: auto;
        }

        ${colLoop()}

        ${colOffsetLoop()}

        .col-${name} {
          flex-grow: 1;
          flex-basis: 0;
          max-width: 100%;
        }
        .start-${name} {
          justify-content: flex-start;
          text-align: left;
        }
  
        .center-${name} {
          justify-content: center;
          text-align: center;
        }
  
        .end-${name} {
          justify-content: flex-end;
        }
  
        .top-${name} {
          align-items: flex-start;
        }
  
        .middle-${name} {
          align-items: center;
        }
  
        .bottom-${name} {
          align-items: flex-end;
        }
  
        .around-${name} {
          justify-content: space-around;
        }
  
        .between-${name} {
          justify-content: space-between;
        }

        .reverse-${name} {
          flex-direction: row-reverse;
        }
  
        .first-${name} {
          order: -1;
        }
  
        .last-${name} {
          order: 1;
        }

        .hide-${name} {
          display: none;
        }

        .show-${name} {
          display: block;
        }

        .col-show-${name} {
          display: flex;
        }
      }
    `;
  }

  return styles;
};

const mainStyles = () => css`
  :root {
    --gutter-compensation: calc(var(--flexboxgrid-gutter-width) * 0.5 * -1);
    --half-gutter-width: calc(var(--flexboxgrid-gutter-width) * 0.5);
  }

  .wrapper {
    box-sizing: border-box;
    max-width: var(--flexboxgrid-max-width);
    margin: 0 auto;
  }

  .container-fluid {
    margin-right: auto;
    margin-left: auto;
    padding-right: var(--flexboxgrid-outer-margin);
    padding-left: var(--flexboxgrid-outer-margin);
  }

  .row {
    box-sizing: border-box;
    display: flex;
    flex: 0 1 auto;
    flex-direction: row;
    flex-wrap: wrap;
    margin-right: var(--gutter-compensation);
    margin-left: var(--gutter-compensation);
  }

  .row.reverse {
    flex-direction: row-reverse;
  }

  .col.reverse {
    flex-direction: column-reverse;
  }

  ${breakpointsStyles()}
`;

const gridStyles = () => css`
  ${gridVars()}
  ${mainStyles()}
`;

export default gridStyles;
