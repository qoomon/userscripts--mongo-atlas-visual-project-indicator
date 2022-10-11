// ==UserScript==
// @name         Mongo Atlas Visual Project Indicator
// @namespace    https://qoomon.github.io
// @version      1.0.0
// @downloadURL  https://github.com/qoomon/userscript-mongo-atlas-visual-project-indicator/raw/main/mongo-atlas-visual-project-indicator.user.js
// @updateURL    https://github.com/qoomon/userscript-mongo-atlas-visual-project-indicator/raw/main/mongo-atlas-visual-project-indicator.user.js
// @description  try to take over the world!
// @author       Bengt, Christian
// @match        https://cloud.mongodb.com/v2/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mongodb.com
// @grant        none
// ==/UserScript==

// --- Configure display name and color ------------------------------------


function getDisplayColor(project) {
    if(project.name.match(/(^|[^a-zA-Z])(production|prod)([^a-zA-Z]|$)/)) return '#921b1d'
    if(project.name.match(/(^|[^a-zA-Z])(staging|stage)([^a-zA-Z]|$)/)) return '#a27401'
    if(project.name.match(/(^|[^a-zA-Z])(sandbox|lab)([^a-zA-Z]|$)/)) return '#016a83'
    return '#7c7c7c'
}

window.addEventListener('changestate', async () => {
    'use strict';

    const headerElement = await untilDefined(() => document.querySelector('[data-testid="mongo-header-container"]'))
    if(headerElement._accountIndicator) return;
    headerElement._accountIndicator = true;

    const project = await getProjectInfo()

    const displayColor = getDisplayColor(project)

    // insert indicator bar
    const indicatorBarElement = document.createElement('div')
    indicatorBarElement.style.cssText = `
      height: 8px;
      background: repeating-linear-gradient(-45deg, ${displayColor}, ${displayColor} 12px, transparent 0px, transparent 24px);
    `;
    const topHeaderElement = await untilDefined(() => document.querySelector('[data-testid="organization-nav"]'))
    topHeaderElement.insertAdjacentElement('afterend', indicatorBarElement)

    // set project background indicator color
    const projectButtonElement = await untilDefined(() => document.querySelector('[data-testid="project-select-trigger"]'))
    projectButtonElement.style.backgroundColor = displayColor;
    projectButtonElement.style.color = 'white';
   [...projectButtonElement.querySelectorAll(':scope svg')].forEach(element => { element.style.color = 'whitesmoke' })
});

// --- Utils ---------------------------------------------------------------

async function untilDefined(fn) {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            const result = fn()
            if (result != undefined) {
                clearInterval(interval)
                resolve(result)
            }
        }, 100)
        })
}

async function getProjectInfo() {
    const orgButtonElement = await untilDefined(() => document.querySelector('[data-testid="org-trigger"]'))
    const projectButtonElement = await untilDefined(() => document.querySelector('[data-testid="project-select-trigger"]'))

    return {
        org: orgButtonElement.innerText,
        name:  projectButtonElement.innerText,
    }
}

// --- Event Management -----------------------------------------------------

window.onload = () => window.dispatchEvent(new Event('changestate'));

window.history.pushState = new Proxy(window.history.pushState, {
  apply: (target, thisArg, argArray) => {
    const result = target.apply(thisArg, argArray)
    window.dispatchEvent(new Event('pushstate'))
    window.dispatchEvent(new Event('changestate'))
    return result
  }
})

window.history.replaceState = new Proxy(window.history.replaceState, {
  apply: (target, thisArg, argArray) => {
    const result = target.apply(thisArg, argArray)
    window.dispatchEvent(new Event('replacestate'))
    window.dispatchEvent(new Event('changestate'))
    return result
  }
})

window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('changestate'));
})
