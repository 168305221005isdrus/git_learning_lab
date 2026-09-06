// Git Learning Lab — reusable simulator workspace (P2): wires the file
// editor, terminal, and visualizer together around one shared, authoritative
// state object (Engineering skill §6 — no independent copies). Used by both
// the free-play "Simulator" panel and the Module 3 lesson's Practice stage.
import { createInitialState, createInitialRemoteState, applyCommand } from "../../shared/simulator-core.js";
import { createTerminal } from "./terminal.js";
import { renderVisualizer } from "./visualizer.js";
import { createFileEditor } from "./file-editor.js";
import { t } from "./i18n.js";

export function createSimulatorWorkspace(container, { onStateChange, initialState, initialRemoteState } = {}) {
  let state = initialState || createInitialState();
  let remoteState = initialRemoteState || createInitialRemoteState();
  const transcript = [];

  container.innerHTML = "";
  container.classList.add("simulator-workspace");

  const editorHost = document.createElement("div");
  const visualizerHost = document.createElement("div");
  const hintsHost = document.createElement("p");
  hintsHost.className = "simulator-hint";
  hintsHost.setAttribute("role", "note");
  const terminalHost = document.createElement("div");
  container.append(editorHost, visualizerHost, hintsHost, terminalHost);

  function updateHint() {
    if (!state.initialized) {
      hintsHost.textContent = t("hintStart");
    } else if (Object.keys(state.stagingArea).length === 0 && state.commits.length === 0) {
      hintsHost.textContent = t("hintOneAtATime");
    } else {
      hintsHost.textContent = t("hintAfterAdd");
    }
  }

  function rerender() {
    renderVisualizer(visualizerHost, state, remoteState);
    updateHint();
    if (onStateChange) onStateChange(state, remoteState);
  }

  createFileEditor(editorHost, {
    getState: () => state,
    onChange: (nextState) => {
      state = nextState;
      rerender();
    },
  });

  const terminal = createTerminal(terminalHost, {
    onCommand: (commandText) => {
      transcript.push(commandText);
      const result = applyCommand(state, commandText, { remoteState });
      state = result.state;
      remoteState = result.remoteState;
      rerender();
      return { output: result.output, error: result.error };
    },
  });

  rerender();

  return {
    getState: () => state,
    getRemoteState: () => remoteState,
    getTranscript: () => [...transcript],
    focusTerminal: () => terminal.focus(),
    printSystemMessage: (text) => terminal.printSystemMessage(text),
  };
}
