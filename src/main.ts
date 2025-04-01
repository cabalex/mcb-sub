import './app.css';
import App from './App.svelte';

const app = new App({
	target: document.getElementById('app')!
});

if (new Date().getMonth() === 3 && new Date().getDate() === 1) {
	document.body.classList.add('april-fools');
}

export default app;
