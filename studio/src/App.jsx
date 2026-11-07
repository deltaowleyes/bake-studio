/* BAKE Studio: the app shell. Header with the five steps, the active step, and Back / Next. */
import { S, commit, useStudio, isStorageFull } from './store.js';
import { STEPS, ensureArt, ensurePages } from './edit.js';
import Step1 from './steps/Step1.jsx';
import Step2 from './steps/Step2.jsx';
import Step3 from './steps/Step3.jsx';
import Step4 from './steps/Step4.jsx';
import Step5 from './steps/Step5.jsx';

const VIEWS = [Step1, Step2, Step3, Step4, Step5];

export function go(n) {
  commit(S => { S.step = n; });
  try { history.replaceState(null, '', '#step-' + n); } catch (e) { /* ignore */ }
  window.scrollTo(0, 0);
}

export default function App() {
  useStudio();
  ensureArt(); ensurePages();   // always have artwork options and a Home page
  const View = VIEWS[S.step - 1] || Step1;
  return <>
    <header className="top">
      <div className="topin">
        <div><h1>BAKE Studio</h1><p className="mu">Build a website in five steps. Your work is saved in this browser.</p></div>
        <nav className="steps" aria-label="Steps">
          {STEPS.map((n, i) => <button key={n} aria-current={S.step == i + 1 ? 'step' : undefined} onClick={() => go(i + 1)}>{i + 1}. {n}</button>)}
        </nav>
      </div>
    </header>
    <main id="app">
      {isStorageFull() && <p className="warn">Your browser’s storage is full, so the latest changes aren’t saved. Try removing some uploaded images.</p>}
      <View go={go} />
      <nav className="pager">
        {S.step > 1 ? <button onClick={() => go(S.step - 1)}>← Back: {STEPS[S.step - 2]}</button> : <span />}
        {S.step < 5 && <button className="pri" onClick={() => go(S.step + 1)}>Next: {STEPS[S.step]} →</button>}
      </nav>
    </main>
  </>;
}
