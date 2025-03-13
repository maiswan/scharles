import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

const noAttr = () => {
    return {
        name: "no-attribute",
        transformIndexHtml(html: string) {
            html = html
                .replaceAll("crossorigin ", "")
                .replaceAll(`type="module" `, "")
                .replaceAll(`"/assets/`, `"./assets/`);

            const scriptIdRegex = /(?<=<script src="\.\/assets\/index-)([\w-\d]+)(?=\.js"><\/script>)/gm;
            const scriptId = html.match(scriptIdRegex);
            html = html.replace(`<script src="./assets/index-${scriptId}.js"></script>`, "")
            console.log(scriptId);
            html = html.replace('<div id="root"></div>', `<div id="root"></div><script src="./assets/index-${scriptId}.js"></script>`)

            return html;
        }
    }
}


// https://vite.dev/config/
export default defineConfig(({ command }) => {
    if (command === 'serve') {
        // dev
        return { plugins: [react(), tailwindcss()] };
    } 
    
    // build
    return { plugins: [react(), tailwindcss(), noAttr()] };
})