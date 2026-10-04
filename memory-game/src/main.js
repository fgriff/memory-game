import { App } from './components/App/App';
import './style.scss';

window.onload = () => {
  const app = new App();
  document.body.prepend(app.element);
};
