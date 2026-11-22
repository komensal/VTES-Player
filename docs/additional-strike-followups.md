# Additional-strike timing: known follow-ups

The targeted limited-source fix prevents a second limited grant in the same
round, separately for each combatant, and resets it for the next round. It
is **not** a complete audit of the additional-strike timing model.

- **Pending strikes and further sources (FIXED):** the grant window no longer
  opens while a minion has additional strikes pending. Pending additional
  strikes resolve FIRST, and only then does the grant window open for another
  source, per [LSJ 20001206](https://www.vekn.net/general-rulings) ("Resolve
  the pending additional strikes before gaining any further additional
  strikes"). Fixed by reordering the post-damage-resolution branch in
  engine.ts; regression test tests/cards/ak47-quickness-order.test.ts (AK-47's
  pending strike resolves before superior Quickness is offered). Still open:
  re-opening the grant window after a completed series for BOTH combatants in
  a multi-source sequence (initial opportunity and sequencing).
- **Optional weapon grants:** AK-47 and Caseless Rounds grant their optional
  additional strike when the engine sees the gun strike. The striker can now
  DECLINE it in the additional sub-round (`strike:decline`: a no-damage
  declaration, which releases the gun commitment; `CombatFrame.optionalAdditionalStrike`).
  Still open: choosing a different limited source instead of the weapon's grant.
  The limited-source guard already stops a second limited grant, and the
  choice has to be made before the grant, not after it. See the
  [VEKN discussion](https://www.vekn.net/forum/rules-questions/69208-additional-strikes-compounded-card-effects).
- **Strike-plus-additional modes:** the current compiler can offer a mode
  which declares a strike as a new card in the additional-strike grant window.
  This timing needs a separate review alongside the pending-strike change;
  don't assume all strike-card interactions are fixed by the limit guard.

These are identified limitations, not completed fixes or manually audited
cards. They are separate from the 4,158-card audit inventory.
