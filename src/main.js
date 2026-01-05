import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'

document.querySelector('#app').innerHTML = `
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
      <div class="flex justify-center gap-8 mb-8">
        <a href="https://vite.dev" target="_blank" class="transition-transform hover:scale-110">
          <img src="${viteLogo}" class="h-24 w-24" alt="Vite logo" />
        </a>
        <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" class="transition-transform hover:scale-110">
          <img src="${javascriptLogo}" class="h-24 w-24" alt="JavaScript logo" />
        </a>
      </div>
      <h1 class="text-4xl font-bold text-center text-gray-800 mb-4">Ayanda Mabaso</h1>
      <p class="text-center text-gray-600 mb-6">Vite + Vanilla JS + Tailwind CSS</p>
      <div class="flex justify-center">
        <button id="counter" type="button" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-colors"></button>
      </div>
      <p class="text-center text-gray-500 text-sm mt-8">
        Click on the Vite logo to learn more
      </p>
    </div>
  </div>
`

setupCounter(document.querySelector('#counter'))
