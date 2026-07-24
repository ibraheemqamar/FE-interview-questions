import { CAT_ORDER } from "../data/categories.js";

export default function Footer({ allCards = [] }) {
  return (
    <footer className="foot">
      {allCards.length} questions across {CAT_ORDER.join(" · ")}
      <br />
      Cover the answer, say it out loud, then check. Progress syncs to cloud when signed in.
    </footer>
  );
}
