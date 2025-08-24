// src/app/shackles/rules/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PathSix | Skull & Shackles Rules Page',
  description:
    'House rules and clarifications for our Skull & Shackles Pathfinder campaign.',
};

export default function RulesPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-16 text-[#c6c4ba]">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
        House Rules &amp; Clarifications
      </h1>

      {/* Level 1: upper-roman */}
      <ol className="pl-6 space-y-6 list-[upper-roman]">
        <li className="font-semibold">
          No third party products
        </li>

        <li>
          <div className="font-semibold">Character creation</div>

          {/* Level 2: upper-alpha */}
          <ol className="pl-6 space-y-3 mt-2 list-[upper-alpha]">
            <li>
              <div className="font-medium">
                Ability stat generation style to be determined by Game Master prior to character generation.
              </div>

              {/* Level 3: decimal */}
              <ol className="pl-6 space-y-2 mt-2 list-decimal">
                <li>
                  <div className="font-medium">Typical styles include:</div>

                  {/* Level 4: lower-alpha */}
                  <ol className="pl-6 space-y-1 mt-2 list-[lower-alpha]">
                    <li>Point build (example: 20 point, place as desired, then apply racial bonus).</li>
                    <li>Dice roll (4d6 drop lowest, place as desired then apply racial bonus).</li>
                    <li>Array (17, 15, 13, 13, 11, 11 place as desired then apply racial bonus).</li>
                  </ol>
                </li>

                <li>
                  <div className="font-medium">For Normal Games</div>

                  {/* Level 4: lower-alpha */}
                  <ol className="pl-6 space-y-1 mt-2 list-[lower-alpha]">
                    <li>
                      {/* Level 5: lower-roman */}
                      <div className="font-normal">
                        Initial Stats (Before racial traits) must be between 10 and 17.
                      </div>
                    </li>
                  </ol>
                </li>
              </ol>
            </li>

            <li>
              <div className="font-medium">Allowed races.</div>

              {/* Level 3: decimal */}
              <ol className="pl-6 space-y-2 mt-2 list-decimal">
                <li>
                  <div className="font-medium">For Normal Game</div>

                  {/* Level 4: lower-alpha */}
                  <ol className="pl-6 space-y-1 mt-2 list-[lower-alpha]">
                    <li>Core races can be freely chosen.</li>
                    <li>Featured races are allowed with discretion, DM’s approval.</li>
                    <li>Uncommon custom races, rarely with DM’s approval.</li>
                    <li>Randomizer with DM’s approval.</li>
                    <li>No custom Races.</li>
                  </ol>
                </li>

                <li>
                  <div className="font-medium">For Short Games</div>

                  {/* Level 4: lower-alpha */}
                  <ol className="pl-6 space-y-1 mt-2 list-[lower-alpha]">
                    <li>Core Races freely chosen.</li>
                    <li>Featured Races freely chosen.</li>
                    <li>Uncommon races with DM’s approval.</li>
                    <li>Freely use randomizer.</li>
                    <li>No custom Races.</li>
                  </ol>
                </li>
              </ol>
            </li>

            <li>
              <div className="font-medium">Banned classes.</div>

              {/* Level 3: decimal */}
              <ol className="pl-6 space-y-2 mt-2 list-decimal">
                <li>
                  <div className="font-medium">For Normal Games.</div>

                  {/* Level 4: lower-alpha */}
                  <ol className="pl-6 space-y-1 mt-2 list-[lower-alpha]">
                    <li>Fighter due to abusive builds, DM discretion per campaign.</li>
                    <li>Summoner</li>
                    <li>Archer</li>
                    <li>Undead Lord</li>
                    <li>Arcane Trickster</li>
                    <li>Arcane Archer</li>
                    <li>Anything from Occult Game</li>
                  </ol>
                </li>

                <li>
                  <div className="font-medium">For Short Games</div>

                  {/* Level 4: lower-alpha */}
                  <ol className="pl-6 space-y-1 mt-2 list-[lower-alpha]">
                    <li>No banned list.</li>
                  </ol>
                </li>
              </ol>
            </li>

            <li>
              <div className="font-medium">Alignment.</div>

              {/* Level 3: decimal */}
              <ol className="pl-6 space-y-1 mt-2 list-decimal">
                <li>Any non-evil alignment is allowed.</li>
              </ol>
            </li>

            <li>
              <div className="font-medium">Equipment.</div>

              {/* Level 3: decimal */}
              <ol className="pl-6 space-y-1 mt-2 list-decimal">
                <li>All characters can start with “mundane” equipment of their choosing.</li>
                <li>No special materials or properties.</li>
                <li>Characters still get starting gold on top of “mundane” equipment.</li>
                <li>Do not worry about encumbrance. It is assumed you can drop your gear at the beginning of battle.</li>
                <li>Unlimited “normal” ammunition except in special circumstances.</li>
                <li>No guns/technology except in the “appropriate” campaigns.</li>
              </ol>
            </li>
          </ol>
        </li>

        <li>
          <div className="font-semibold">Character Advancement</div>

          {/* Level 2: upper-alpha */}
          <ol className="pl-6 space-y-3 mt-2 list-[upper-alpha]">
            <li>
              <div className="font-medium">Experience Points</div>

              {/* Level 3: decimal */}
              <ol className="pl-6 space-y-1 mt-2 list-decimal">
                <li>Use “Fast Experience track”.</li>
                <li>All party members equally split XP, and will be the same level.</li>
              </ol>
            </li>

            <li>
              <div className="font-medium">Hit Points</div>

              {/* Level 3: decimal */}
              <ol className="pl-6 space-y-2 mt-2 list-decimal">
                <li>
                  IF rolling for Hit points, reroll until you get a number on the upper half of the die.

                  {/* Level 4: lower-alpha */}
                  <ol className="pl-6 space-y-1 mt-2 list-[lower-alpha]">
                    <li>
                      {/* Level 5: lower-roman */}
                      <ol className="pl-6 space-y-1 mt-2 list-[lower-roman]">
                        <li>Example: if you roll a d8 for HP, you can re-roll any result of 1–4.</li>
                      </ol>
                    </li>
                  </ol>
                </li>
                <li>Standard rule: Take maximum hit points per level.</li>
              </ol>
            </li>
          </ol>
        </li>

        <li>
          <div className="font-semibold">Spells and Magic</div>

          {/* Level 2: upper-alpha */}
          <ol className="pl-6 space-y-1 mt-2 list-[upper-alpha]">
            <li>Use Spell memorization per rulebooks.</li>
            <li>No spell components are required.</li>
            <li>Spell Concentration is not used.</li>
            <li>Use the spell templates we have created instead of the “grid” spell areas.</li>
          </ol>
        </li>

        <li>
          <div className="font-semibold">Combat</div>

          {/* Level 2: upper-alpha */}
          <ol className="pl-6 space-y-3 mt-2 list-[upper-alpha]">
            <li>Bleed is not used.</li>

            <li>
              <div className="font-medium">Critical hits</div>

              {/* Level 3: decimal */}
              <ol className="pl-6 space-y-1 mt-2 list-decimal">
                <li>
                  A roll of a 20 is always a critical, unless a 20 is the only way you could hit the opponent. In this case, the Natural 20 is still a hit, but must be confirmed to be a critical.
                </li>
              </ol>
            </li>

            <li>
              <div className="font-medium">Surprise Round</div>

              {/* Level 3: decimal */}
              <ol className="pl-6 space-y-1 mt-2 list-decimal">
                <li>If surprised (unaware) you are considered flat-footed until your turn and do not get to act in the surprise round.</li>
                <li>If not surprised, you may take a Move or a Standard action.</li>
                <li>Even if you have already gone, you are still considered flat-footed vs. undetected (Stealth or Invisible) opponents.</li>
              </ol>
            </li>

            <li>
              <div className="font-medium">Precision Damage</div>

              {/* Level 3: decimal */}
              <ol className="pl-6 space-y-1 mt-2 list-decimal">
                <li>If any of your attacks qualify for precision damage (backstab) during a round then all of your attacks versus the same opponent qualify for precision damage.</li>
                <li>You cannot use precision damage against an opponent who has concealment.</li>
              </ol>
            </li>

            <li>
              <div className="font-medium">Sniping (Attack at range, while stealthy)</div>

              {/* Level 3: decimal */}
              <ol className="pl-6 space-y-1 mt-2 list-decimal">
                <li>Can grant precision damage if applicable, typically to a target which has not seen you.</li>
                <li>
                  After your attack, if you have not moved, you may make a stealth check. If successful, then you have not been spotted and may attack again from stealth the next round.
                </li>
              </ol>
            </li>
          </ol>
        </li>

        <li>
          <div className="font-semibold">Movement</div>

          {/* Level 2: upper-alpha */}
          <ol className="pl-6 space-y-1 mt-2 list-[upper-alpha]">
            <li>Diagonal movement is still 5′ per square, no normal square counts double.</li>
          </ol>
        </li>

        <li>
          <div className="font-semibold">Skill and Ability checks</div>

          {/* Level 2: upper-alpha */}
          <ol className="pl-6 space-y-1 mt-2 list-[upper-alpha]">
            <li>A roll of a 20 is always a success, a roll of a 1 is always a failure.</li>
          </ol>
        </li>

        <li>
          <div className="font-semibold">Poison</div>

          {/* Level 2: upper-alpha */}
          <ol className="pl-6 space-y-1 mt-2 list-[upper-alpha]">
            <li>Characters use the Unchained Poison rules.</li>
            <li>Encounters use the rules as written.</li>
          </ol>
        </li>

        <li>
          <div className="font-semibold">Saving throws</div>

          {/* Level 2: upper-alpha */}
          <ol className="pl-6 space-y-1 mt-2 list-[upper-alpha]">
            <li>A natural 20 is always a success.</li>
            <li>A natural 1 is always a failure.</li>
            <li>Items do not need to make a check on a natural roll of a 1.</li>
          </ol>
        </li>

        <li>
          <div className="font-semibold">Magic items and Items carried</div>

          {/* Level 2: upper-alpha */}
          <ol className="pl-6 space-y-2 mt-2 list-[upper-alpha]">
            <li>
              Cannot be damaged or broken unless specifically targeted.

              {/* Level 3: decimal */}
              <ol className="pl-6 space-y-1 mt-2 list-decimal">
                <li>Unless their description says otherwise.</li>
              </ol>
            </li>
            <li>Testing for this campaign: Auto Bonus Progression rules</li>
          </ol>
        </li>

        <li>
          <div className="font-semibold">Eidolon</div>

          {/* Level 2: upper-alpha */}
          <ol className="pl-6 space-y-1 mt-2 list-[upper-alpha]">
            <li>
              Equipment which has been attuned to the Eidolon (worn/wielded for 12 hours) travels with the Eidolon when it is summoned/banished.
            </li>
          </ol>
        </li>

        <li>
          <div className="font-semibold">Feats</div>

          {/* Level 2: upper-alpha */}
          <ol className="pl-6 space-y-2 mt-2 list-[upper-alpha]">
            <li>Use the Elephant in the Room “Weapon groups”.</li>
            <li>
              <div className="font-medium">Banned Feats</div>

              {/* Level 3: decimal */}
              <ol className="pl-6 space-y-1 mt-2 list-decimal">
                <li>Leadership</li>
              </ol>
            </li>
          </ol>
        </li>
      </ol>
    </main>
  );
}
