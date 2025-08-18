// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // 💡 GitHub Pages에 배포하기 위해 'base' 속성을 추가합니다.
    base: '/To-Do-List/', // <-- 여기에 본인의 저장소 이름을 넣어주세요!
});