// Git Learning Lab — reusable Quiz component (P3, QUIZ-001..003; P8: bounded
// random subset per attempt).
//
// QUIZ-002: scoring is NEVER computed here — this component only renders a
// question subset from shared/quiz-data.js and posts the learner's raw
// answers to the Worker (api.submitQuiz), then renders whatever the Worker's
// authoritative response says. There is exactly one scoring implementation
// (shared/quiz-data.js's scoreQuizAttempt, run server-side) reused by every
// quiz.
//
// P8: each attempt shows a bounded random subset of the module's question
// bank (when the bank is larger than the subset size), computed by the SAME
// deterministic function the Worker uses to score — see
// shared/quiz-data.js's design note above `buildQuizAttemptSeed`. This
// component's own subset computation is DISPLAY-ONLY; the Worker
// independently recomputes the authoritative subset from data only it
// controls (the session's own user id and this user's own previous result),
// so nothing here can be tampered with to change what gets scored.
//
// A11Y-003: correctness is never color-only — every per-question result is
// paired with a "✓ ถูกต้อง" / "✖ ไม่ถูกต้อง" text label (i18n).
import { getQuiz, selectQuizQuestions, questionsForDisplay, buildQuizAttemptSeed } from "../../shared/quiz-data.js";
import { t } from "./i18n.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export async function renderQuiz(container, quizId, { api, user, onCompleted, onReviewLesson } = {}) {
  const quiz = getQuiz(quizId);
  container.innerHTML = "";
  if (!quiz) {
    container.appendChild(el("p", "field-error", t("quizLoadError")));
    return;
  }

  const heading = el("h3", null, quiz.title);
  container.appendChild(heading);
  if (quiz.optional) {
    container.appendChild(el("p", "quiz-optional-badge", t("quizOptionalNotice")));
  }

  // P8: fetch this learner's own previous result (if any) for THIS quiz, so
  // the subset shown here matches what the Worker will independently
  // recompute at submit time (same seed inputs on both sides — see
  // shared/quiz-data.js). Falls back to showing the full bank if the
  // learner's own results can't be loaded, rather than blocking the quiz.
  let previousUpdatedAt = null;
  let previousResult = null;
  if (api && user) {
    const resultsRes = await api.getQuizResults();
    if (resultsRes.ok) {
      previousResult = resultsRes.data.results.find((r) => r.quiz_id === quizId) || null;
      previousUpdatedAt = previousResult?.updated_at || null;
    }
  }
  const seedKey = user ? buildQuizAttemptSeed(user.id, quizId, previousUpdatedAt) : "first-attempt";
  const subsetFull = selectQuizQuestions(quizId, seedKey) || quiz.questions;
  const displayQuestions = questionsForDisplay(subsetFull);

  if (previousResult) {
    container.appendChild(
      el(
        "p",
        "quiz-previous-result",
        t("quizPreviousResult", previousResult.correct_count, previousResult.total, previousResult.percent, previousResult.updated_at)
      )
    );
  }

  const form = document.createElement("form");
  form.className = "quiz-form";
  const selections = new Array(displayQuestions.length).fill(undefined);
  const questionBlocks = [];

  displayQuestions.forEach((q, qIndex) => {
    const block = el("fieldset", "quiz-question");
    const legend = el("legend", null, `${qIndex + 1}. ${q.text}`);
    block.appendChild(legend);

    const choiceList = el("div", "quiz-choices");
    q.choices.forEach((choiceText, cIndex) => {
      const label = el("label", "quiz-choice");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `${quiz.id}-${q.id}`;
      radio.value = String(cIndex);
      radio.addEventListener("change", () => {
        selections[qIndex] = cIndex;
      });
      label.appendChild(radio);
      label.appendChild(document.createTextNode(" " + choiceText));
      choiceList.appendChild(label);
    });
    block.appendChild(choiceList);

    const feedback = el("p", "quiz-question-feedback");
    feedback.setAttribute("role", "status");
    block.appendChild(feedback);

    form.appendChild(block);
    questionBlocks.push({ feedback, radios: () => Array.from(choiceList.querySelectorAll("input")) });
  });

  const submitError = el("p", "field-error");
  submitError.setAttribute("role", "alert");
  const submitBtn = el("button", null, t("quizSubmit"));
  submitBtn.type = "submit";
  form.appendChild(submitError);
  form.appendChild(submitBtn);

  const scoreSummary = el("p", "quiz-score-summary");
  scoreSummary.setAttribute("role", "status");
  container.appendChild(form);
  container.appendChild(scoreSummary);

  if (onReviewLesson) {
    const reviewBtn = el("button", "btn btn-secondary quiz-review-btn", t("quizReviewLesson"));
    reviewBtn.type = "button";
    reviewBtn.addEventListener("click", onReviewLesson);
    container.appendChild(reviewBtn);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitError.textContent = "";

    if (selections.some((s) => s === undefined)) {
      submitError.textContent = t("quizPickOne");
      return;
    }

    submitBtn.disabled = true;
    const res = await api.submitQuiz(quizId, selections);
    submitBtn.disabled = false;

    if (!res.ok) {
      submitError.textContent = t("quizLoadError");
      return;
    }

    const { correctCount, total, percent, results } = res.data;
    scoreSummary.textContent = `${t("quizCorrectCount", correctCount, total)} — ${t("quizScorePercent", percent)}`;

    results.forEach((r, i) => {
      const { feedback, radios } = questionBlocks[i];
      radios().forEach((radio) => (radio.disabled = true));
      feedback.textContent = r.correct
        ? t("quizYourAnswerCorrect")
        : `${t("quizYourAnswerWrong")} — ${t("quizExplanationLabel")}${r.explanation}`;
      feedback.classList.add(r.correct ? "quiz-question-feedback--correct" : "quiz-question-feedback--wrong");
    });

    submitBtn.textContent = t("quizRetake");
    submitBtn.disabled = false;
    submitBtn.type = "button";
    submitBtn.onclick = () => renderQuiz(container, quizId, { api, user, onCompleted, onReviewLesson });

    if (onCompleted) onCompleted({ correctCount, total, percent });
  });
}
