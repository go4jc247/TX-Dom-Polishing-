// ============================================================
// TX-Dom-Dev — dev-tools.js
// Game Log + Advanced AI Log (v14.6.0: developer-mode tools removed; the file keeps its name
// so the page and the offline cache do not need restructuring)
// ============================================================

/******************************************************************************
 * GAME LOG FUNCTIONALITY (v2.0 - Detailed Format)
 ******************************************************************************/
// handNumber, trickNumber, currentTrickPlays declared in game.js stubs
handNumber = 0;
trickNumber = 0;
currentTrickPlays = [];

// Helper functions
function _tileStr(t){ return t ? `${t[0]}-${t[1]}` : null; }
function _tilesStr(arr){ return (arr||[]).map(t => _tileStr(t)); }
function _partnerSeats(seat){
  if(seat % 2 === 0) return [0,2,4].filter(s => s !== seat);
  return [1,3,5].filter(s => s !== seat);
}

function logHandStart(trumpMode, trumpSuit, contract, bid, bidderSeat, hands, dealerSeat, leaderSeat, scoresBeforeHand){
  let trumpDisplay = "";
  if(contract === "NELLO"){
    trumpDisplay = "Nel-O";
  } else if(trumpMode === "DOUBLES"){
    trumpDisplay = "Doubles";
  } else if(trumpMode === "NONE" || trumpSuit === null){
    trumpDisplay = "No Trumps (NT)";
  } else if(trumpMode === "PIP"){
    trumpDisplay = `${trumpSuit}s`;
  }

  const entry = {
    type: "HAND_START",
    handId: handNumber,
    dealerSeat: dealerSeat,
    leaderSeat: leaderSeat,
    contract: {
      mode: contract,
      trumpMode: trumpMode,
      trumpSuit: trumpSuit,
      trumpDisplay: trumpDisplay,
      bid: bid,
      bidderSeat: bidderSeat,
      bidderTeam: bidderSeat !== null ? (bidderSeat % 2 === 0 ? 1 : 2) : null
    },
    scoresBeforeHand: scoresBeforeHand || { team1: 0, team2: 0 },
    hands: hands ? hands.map((h, seat) => ({
      seat: seat,
      team: seat % 2 === 0 ? 1 : 2,
      tiles: _tilesStr(h)
    })) : null,
    timestamp: new Date().toISOString()
  };

  // V12.10.4: Attach pre-swap Moon state for replay
  if(session && session._dealSnapshot){
    entry.moon_widow = session._dealSnapshot.moon_widow;
    entry.preSwapHands = session._dealSnapshot.hands.map((h, seat) => ({
      seat: seat,
      team: seat % 2 === 0 ? 1 : 2,
      tiles: _tilesStr(h)
    }));
    session._dealSnapshot = null; // consumed
  }

  trickNumber = 0;
  currentTrickPlays = [];
  gameLog.push(entry);
  saveGameLog();
}

function logTrickStart(leaderSeat, ledPip){
  const entry = {
    type: "TRICK_START",
    handId: handNumber,
    trickId: trickNumber,
    leaderSeat: leaderSeat,
    leaderTeam: leaderSeat % 2 === 0 ? 1 : 2,
    ledPip: ledPip,
    timestamp: new Date().toISOString()
  };
  currentTrickPlays = [];
  gameLog.push(entry);
  saveGameLog();
}

function logPlay(player, tile, reason, isAISeat, aiRec, playContext){
  const ctx = playContext || {};
  const aiTile = aiRec ? aiRec.tile : null;
  const wasOverride = !isAISeat && aiTile && (!tile || tile[0] !== aiTile[0] || tile[1] !== aiTile[1]);

  const entry = {
    type: "PLAY",
    handId: handNumber,
    trickId: trickNumber,
    seat: player,
    tilePlayed: _tileStr(tile),
    isAISeat: isAISeat,
    wasOverride: wasOverride,
    aiSuggestedTile: aiTile ? _tileStr(aiTile) : null,
    aiReason: aiRec ? aiRec.reason : (reason || null),
    aiDebug: aiRec && aiRec.debugInfo ? aiRec.debugInfo : null,
    legalMoves: ctx.legalTiles ? _tilesStr(ctx.legalTiles) : null,
    partnerCurrentlyWinning: ctx.currentWinner ? (_partnerSeats(player).includes(ctx.currentWinner.seat)) : false,
    positionInTrick: currentTrickPlays.length,
    timestamp: new Date().toISOString()
  };

  currentTrickPlays.push(entry);
  gameLog.push(entry);
  saveGameLog();
}

function logTrickEnd(winnerSeat, points){
  const playsString = currentTrickPlays.map(p => `P${seatToPlayer(p.seat)}:${p.tilePlayed}`).join(' → ');

  // Capture end-of-trick state summary by running AI analysis from seat 0's perspective
  // This gives us the void tracking, trump control, and bid safety state AFTER this trick
  let trickEndState = null;
  try {
    // Run AI from seat 0 just to get the debug info (won't actually play)
    // IMPORTANT: Temporarily clear current_trick so AI evaluates as if leading
    // the NEXT trick (current_trick still has the just-completed trick's plays
    // at this point because collectToHistory hasn't finished yet)
    const savedTrick = session.game.current_trick;
    session.game.current_trick = [];
    const debugRec = choose_tile_ai(session.game, 0, session.contract, true, session.current_bid);
    session.game.current_trick = savedTrick;
    if(debugRec && debugRec.debugInfo){
      const d = debugRec.debugInfo;
      trickEndState = {
        teamScores: [session.game.team_points[0], session.game.team_points[1]],
        voidTracking: d.voidTracking || {},
        trumpControl: d.weHaveTrumpControl || false,
        opponentsVoidInTrump: d.opponentsVoidInTrump || false,
        partnersHaveTrump: d.partnersHaveTrump,
        trumpsRemaining: d.trumpsRemaining || [],
        bidSafety: d.bidSafety || null,
        trumpsInHand: d.trumpsInHand || []
      };
    }
  } catch(e) {
    // If AI fails (e.g., hand is over), just skip
  }

  const entry = {
    type: "TRICK_END",
    handId: handNumber,
    trickId: trickNumber,
    winnerSeat: winnerSeat,
    winnerTeam: winnerSeat % 2 === 0 ? 1 : 2,
    pointsInTrick: points,
    playsString: playsString,
    trickEndState: trickEndState,
    timestamp: new Date().toISOString()
  };

  gameLog.push(entry);
  trickNumber++;
  currentTrickPlays = [];
  saveGameLog();
}

function logHandEnd(winner, bidMade){
  const entry = {
    type: "HAND_END",
    handId: handNumber,
    finalScores: {
      team1: session.game.team_points[0],
      team2: session.game.team_points[1]
    },
    winner: winner,
    bidMade: bidMade,
    timestamp: new Date().toISOString()
  };

  gameLog.push(entry);
  handNumber++;
  trickNumber = 0;
  saveGameLog();
}

// Legacy function for backwards compatibility
function logEvent(type, data){
  if(type === 'HAND_END'){
    const status = data.status || '';
    const bidMade = status.includes('made') || status.includes('success');
    logHandEnd(status, bidMade);
  }
  // Other types handled by specific functions
}

function saveGameLog(){
  try {
    // Keep log manageable
    if(gameLog.length > 500) gameLog = gameLog.slice(-500);
    localStorage.setItem(GAME_LOG_KEY, JSON.stringify({
      log: gameLog,
      handNumber: handNumber,
      trickNumber: trickNumber
    }));
  } catch(e) {}
}

function loadGameLog(){
  try {
    const saved = localStorage.getItem(GAME_LOG_KEY);
    if(saved){
      const data = JSON.parse(saved);
      if(Array.isArray(data)){
        // Old format
        gameLog = data;
      } else {
        // New format with metadata
        gameLog = data.log || [];
        handNumber = data.handNumber || 0;
        trickNumber = data.trickNumber || 0;
      }
    }
  } catch(e) {
    gameLog = [];
  }
}

function formatGameLog(){
  let text = "=== TENNESSEE 51 GAME LOG (v2.0) ===\n\n";

  for(const entry of gameLog){
    if(entry.type === "HAND_START"){
      text += `\n========== HAND ${entry.handId + 1} ==========\n`;
      const c = entry.contract || {};
      text += `  Dealer: P${seatToPlayer(entry.dealerSeat||0)} | Leader: P${seatToPlayer(entry.leaderSeat||0)}\n`;
      text += `  Contract: ${c.mode || "NORMAL"} | Trump: ${c.trumpDisplay || "?"} | Bid: ${c.bid || "?"}\n`;
      text += `  Bidder: P${seatToPlayer(c.bidderSeat||0)} (Team ${c.bidderTeam || "?"})\n`;
      const scores = entry.scoresBeforeHand || {};
      text += `  Scores Before: Team1=${scores.team1||0} Team2=${scores.team2||0}\n`;
      if(entry.hands){
        text += `  Starting Hands:\n`;
        for(const h of entry.hands){
          if(h.tiles && h.tiles.length > 0){
            text += `    P${seatToPlayer(h.seat)} (T${h.team}): ${h.tiles.join(", ")}\n`;
          }
        }
      }
    } else if(entry.type === "TRICK_START"){
      text += `\n  --- Trick ${entry.trickId + 1} ---\n`;
      text += `    Leader: P${seatToPlayer(entry.leaderSeat)} (Team ${entry.leaderTeam}) | Led pip: ${entry.ledPip !== null ? entry.ledPip : "?"}\n`;
    } else if(entry.type === "PLAY"){
      const actor = entry.isAISeat ? "[AI]" : "[Human]";
      text += `    P${seatToPlayer(entry.seat)} ${actor}: ${entry.tilePlayed}`;
      if(entry.aiReason) text += ` (${entry.aiReason})`;
      if(entry.wasOverride){
        text += ` [OVERRIDE! AI wanted: ${entry.aiSuggestedTile}]`;
      } else if(!entry.isAISeat && entry.aiSuggestedTile){
        text += ` [AI agreed]`;
      }
      if(entry.partnerCurrentlyWinning) text += ` [partner winning]`;
      text += "\n";
      if(entry.legalMoves && entry.legalMoves.length > 1){
        text += `      Legal: ${entry.legalMoves.join(", ")}\n`;
      }
    } else if(entry.type === "TRICK_END"){
      text += `    >> Winner: P${seatToPlayer(entry.winnerSeat)} (Team ${entry.winnerTeam}) +${entry.pointsInTrick} pts\n`;
      text += `    >> Plays: ${entry.playsString}\n`;
    } else if(entry.type === "HAND_END"){
      const scores = entry.finalScores || {};
      text += `\n  ====== HAND ${entry.handId + 1} RESULT ======\n`;
      text += `  Final: Team1=${scores.team1||0} Team2=${scores.team2||0}\n`;
      text += `  ${entry.winner || ""}\n`;
      text += `  Bid made: ${entry.bidMade ? "Yes" : "No"}\n`;
    }
  }

  return text || 'No log entries yet.';
}

function formatAdvancedLog(){
  let text = "=== TENNESSEE 51 — ADVANCED AI DEBUG LOG ===\n";
  text += "=== Generated: " + new Date().toISOString() + " ===\n\n";

  let _noTrump = false;  // Track if current hand has no trumps (Nello or No Trump)
  for(const entry of gameLog){
    if(entry.type === "HAND_START"){
      const c = entry.contract || {};
      _noTrump = (c.mode === "NELLO" || c.mode === "NONE" || c.mode === "NO_TRUMP");
      text += "\n" + "=".repeat(70) + "\n";
      text += " HAND " + (entry.handId + 1) + "\n";
      text += "=".repeat(70) + "\n";
      text += "Contract: " + (c.mode||"NORMAL") + " | Trump: " + (c.trumpDisplay||"?");
      text += " | Bid: " + (c.bid||"?") + " by P" + seatToPlayer(c.bidderSeat||0);
      text += " (Team " + (c.bidderTeam||"?") + ")\n";
      const scores = entry.scoresBeforeHand || {};
      text += "Scores Before: Team1=" + (scores.team1||0) + " Team2=" + (scores.team2||0) + "\n";
      if(entry.hands){
        text += "Hands:\n";
        for(const h of entry.hands){
          if(h.tiles && h.tiles.length > 0){
            text += "  P" + seatToPlayer(h.seat) + " (T" + h.team + "): " + h.tiles.join(", ") + "\n";
          }
        }
      }
    }
    else if(entry.type === "TRICK_START"){
      text += "\n--- Trick " + (entry.trickId + 1) + " ---\n";
      text += "  Leader: P" + seatToPlayer(entry.leaderSeat) + " (Team " + entry.leaderTeam + ")\n";
    }
    else if(entry.type === "PLAY"){
      const actor = entry.isAISeat ? "[AI]" : "[Human]";
      text += "\n  P" + seatToPlayer(entry.seat) + " " + actor + " plays: " + entry.tilePlayed;
      if(entry.aiReason) text += " — " + entry.aiReason;
      if(entry.wasOverride) text += " [OVERRIDE! AI wanted: " + entry.aiSuggestedTile + "]";
      text += "\n";
      if(entry.legalMoves && entry.legalMoves.length > 1){
        text += "    Legal moves: " + entry.legalMoves.join(", ") + "\n";
      }

      // === ADVANCED DEBUG ===
      const d = entry.aiDebug;
      if(d){
        text += "    ┌─── AI REASONING ───\n";
        text += "    │ Seat: " + d.seat + " | Team: " + d.myTeam + " | Trick: " + d.trickNum;
        text += " | " + (d.isLead ? "LEADING" : "FOLLOWING (led pip: " + d.ledPip + ")") + "\n";
        text += "    │ Hand: [" + (d.handTiles||[]).join(", ") + "]\n";
        text += "    │ Legal: [" + (d.legalTiles||[]).join(", ") + "]\n";
        text += "    │ Played tiles tracked: " + d.playedCount + "\n";

        // Trump info
        if(d.trumpMode && d.trumpMode !== "NONE"){
          text += "    │\n";
          text += "    │ TRUMP: mode=" + d.trumpMode + " suit=" + d.trumpSuit + "\n";
          text += "    │   In hand: [" + (d.trumpsInHand||[]).join(", ") + "]\n";
          text += "    │   Remaining (not in hand): [" + (d.trumpsRemaining||[]).join(", ") + "]\n";
          text += "    │   I have highest trump: " + d.iHaveHighestTrump;
          text += " (my rank: " + d.myHighestTrumpRank + " vs remaining: " + d.highestRemainingTrumpRank + ")\n";
        }

        // Suit analysis
        if(d.suitAnalysis){
          const sa = d.suitAnalysis;
          const pips = Object.keys(sa).sort((a,b) => Number(a)-Number(b));
          if(pips.length > 0){
            text += "    │\n";
            text += "    │ SUIT ANALYSIS:\n";
            for(const pip of pips){
              const s = sa[pip];
              text += "    │   Suit " + pip + ": " + s.tilesLeft + " tiles left";
              text += ", count exposure=" + s.countExposure;
              text += ", double " + (s.doubleOut ? "OUT" : "still in (" + s.doubleCount + "pts)") + "\n";
            }
          }
        }

        // Void tracking (suppress trump void info in Nello/No Trump)
        if(d.voidTracking && Object.keys(d.voidTracking).length > 0){
          text += "    │\n";
          text += "    │ VOID TRACKING:\n";
          for(const [seat, info] of Object.entries(d.voidTracking)){
            if(info.voidSuits && info.voidSuits.length === 0 && !info.trumpVoidConfirmed && !(info.trumpVoidLikely > 0)){
              text += "    │   " + seat + " (" + info.team + "): no voids detected\n";
            } else {
              text += "    │   " + seat + " (" + info.team + "): void in suits [" + info.voidSuits.join(",") + "]";
              if(!_noTrump){
                if(info.trumpVoidConfirmed) text += " | TRUMP VOID (confirmed)";
                else if(info.trumpVoidLikely > 0) text += " | trump void likely (" + Math.round(info.trumpVoidLikely*100) + "%)";
              }
              text += "\n";
            }
          }
        }

        // Trump control (skip entirely in Nello/No Trump)
        if(!_noTrump){
          text += "    │\n";
          text += "    │ TRUMP CONTROL: " + (d.weHaveTrumpControl ? "YES ✓" : "NO");
          text += " (opps void: " + d.opponentsVoidInTrump + ", partners have trump: " + d.partnersHaveTrump;
          if(d.partnersHoldRemainingTrumps) text += ", PARTNERS HOLD ALL REMAINING TRUMPS";
          text += ")\n";
        }

        // Bid safety
        if(d.bidSafety){
          const b = d.bidSafety;
          text += "    │ BID: " + b.currentBid + " | Our score: " + b.ourScore;
          text += " | Need: " + b.pointsNeeded + " | ";
          if(b.bidIsSafe) text += "SAFE";
          else if(b.bidIsClose) text += "CLOSE!";
          else text += "still working";
          text += " | Tricks left: " + b.tricksLeft + "\n";
        }

        // Last trump (skip in Nello/No Trump)
        if(d.lastTrump && !_noTrump){
          text += "    │ LAST TRUMP: " + (d.lastTrump.isLastTrump ? "YES, only 1 left" : "No");
          if(d.lastTrump.isLastTrump) text += " → " + (d.lastTrump.shouldSaveLastTrump ? "SAVING IT" : "will use if needed");
          text += "\n";
        }

        // Lead categories
        if(d.leadCategories){
          const lc = d.leadCategories;
          text += "    │\n";
          text += "    │ LEAD PHASE: " + lc.phase + "\n";
          if(lc.partnersHoldTrumps) text += "    │   ★ Partners hold all remaining trumps\n";
          if(lc.sacrificeLowTrumpEligible){
            text += "    │   ★ Low-trump sacrifice check (no doubles, 2+ trumps)";
            if(lc.sacrificeRankCheck){
              const rc = lc.sacrificeRankCheck;
              text += ": my lowest=" + rc.myLowestRank + " vs partner highest=" + rc.partnerHighestRank;
              text += rc.partnerCanBeat ? " → SACRIFICE OK" : " → SKIP (partner can't beat)";
            }
            text += "\n";
          }
          if(!_noTrump && lc.trumpDoubles.length) text += "    │   Trump doubles: [" + lc.trumpDoubles.join(", ") + "]\n";
          if(!_noTrump && lc.otherTrumps.length) text += "    │   Other trumps: [" + lc.otherTrumps.join(", ") + "]\n";
          if(lc.nonTrumpDoubles.length) text += "    │   Non-trump doubles: [" + lc.nonTrumpDoubles.join(", ") + "]\n";
          if(lc.nonTrumpSingles.length) text += "    │   Non-trump singles: [" + lc.nonTrumpSingles.join(", ") + "]\n";
        }

        // Lead candidates (danger scoring)
        if(d.leadCandidates && d.leadCandidates.length > 0){
          text += "    │\n";
          text += "    │ LEAD CANDIDATE SCORES (danger scoring):\n";
          const sorted = [...d.leadCandidates].sort((a,b) => b.totalScore - a.totalScore);
          for(const c of sorted){
            text += "    │   " + c.tile + " (suit " + c.suit + "): SCORE=" + c.totalScore;
            if(c.count) text += " [count=" + c.count + "pts]";
            text += "\n";
            const bk = c.breakdown;
            const parts = [];
            if(bk.doubleNotOut !== undefined) parts.push("dbl-not-out=" + bk.doubleNotOut);
            if(bk.doubleOut !== undefined) parts.push("dbl-out=+" + bk.doubleOut);
            if(bk.doubleCountPenalty) parts.push("dbl-count=" + bk.doubleCountPenalty);
            if(bk.myCountPenalty) parts.push("my-count=" + bk.myCountPenalty);
            if(bk.suitCountRisk) parts.push("suit-risk=" + bk.suitCountRisk);
            if(bk.suitCountBonus) parts.push("suit-bonus=+" + bk.suitCountBonus);
            if(bk.tilesLeftPenalty) parts.push("tiles-left=" + bk.tilesLeftPenalty);
            if(bk.oppVoidTrumpRisk) parts.push("opp-trump-risk=" + bk.oppVoidTrumpRisk);
            if(bk.oppVoidSafe) parts.push("opp-safe=+" + bk.oppVoidSafe);
            parts.push("pip=" + bk.pipPenalty);
            parts.push("sum=" + bk.sumPenalty);
            if(parts.length) text += "    │     → " + parts.join(", ") + "\n";
          }
        }

        // Follow suit debug
        if(d.followSuit){
          const fs = d.followSuit;
          text += "    │\n";
          text += "    │ FOLLOW SUIT: led pip=" + fs.ledPip;
          text += " | winner=P" + fs.currentWinnerSeat + " (rank " + fs.winnerRank + (fs.winnerIsTrump ? " TRUMP" : "") + ")\n";
          text += "    │   Can beat winner: " + fs.canBeat + "\n";
          for(const c of fs.candidates){
            text += "    │   " + c.tile + ": rank=" + c.rank + (c.isDouble ? " (DOUBLE)" : "") + "\n";
          }
        }

        // Trump-in debug (skip in Nello/No Trump)
        if(d.trumpIn && !_noTrump){
          const ti = d.trumpIn;
          text += "    │\n";
          text += "    │ TRUMP IN: highest in trick=" + ti.highestTrickTrump;
          text += " | opp trumped=" + ti.oppHasTrump + " | partner trumped=" + ti.partnerHasTrump + "\n";
          for(const c of ti.candidates){
            text += "    │   " + c.tile + ": rank=" + c.rank + (c.canWin ? " (WINS)" : " (loses)") + "\n";
          }
        }

        // Dump candidates
        if(d.dumpCandidates && d.dumpCandidates.length > 0){
          text += "    │\n";
          text += "    │ DUMP CANDIDATE SCORES:\n";
          const sorted = [...d.dumpCandidates].sort((a,b) => b.totalScore - a.totalScore);
          for(const c of sorted){
            text += "    │   " + c.tile + ": SCORE=" + c.totalScore;
            if(c.count) text += " [count=" + c.count + "pts]";
            text += "\n";
            const bk = c.breakdown;
            const parts = [];
            if(bk.voidBonus) parts.push("void=+" + bk.voidBonus);
            if(bk.suitCounts) parts.push("suits=" + bk.suitCounts);
            if(bk.countPenalty) parts.push("count=" + bk.countPenalty);
            parts.push("sum=" + bk.sumPenalty);
            if(bk.trumpPenalty) parts.push("trump=" + bk.trumpPenalty);
            if(bk.lastTrumpPenalty) parts.push("last-trump=" + bk.lastTrumpPenalty);
            if(parts.length) text += "    │     → " + parts.join(", ") + "\n";
          }
        }

        text += "    └─────────────────────\n";
      }
    }
    else if(entry.type === "TRICK_END"){
      text += "  >> Winner: P" + seatToPlayer(entry.winnerSeat) + " (Team " + entry.winnerTeam + ") +" + entry.pointsInTrick + " pts\n";
      text += "  >> " + entry.playsString + "\n";

      // End-of-trick state summary
      const ts = entry.trickEndState;
      if(ts){
        text += "  ┌─── END OF TRICK STATE ───\n";
        text += "  │ Scores: Team1=" + ts.teamScores[0] + " Team2=" + ts.teamScores[1] + "\n";

        if(ts.bidSafety){
          const b = ts.bidSafety;
          text += "  │ Bid: " + b.currentBid + " | Need: " + b.pointsNeeded + " | ";
          if(b.bidIsSafe) text += "SAFE";
          else if(b.bidIsClose) text += "CLOSE!";
          else text += "still working";
          text += " | Tricks left: " + b.tricksLeft + "\n";
        }

        if(!_noTrump){
          if(ts.trumpsInHand && ts.trumpsInHand.length > 0){
            text += "  │ P1 trumps: [" + ts.trumpsInHand.join(", ") + "]\n";
          }
          if(ts.trumpsRemaining && ts.trumpsRemaining.length > 0){
            text += "  │ Trumps still out: [" + ts.trumpsRemaining.join(", ") + "]\n";
          } else {
            text += "  │ Trumps still out: none (all accounted for)\n";
          }

          text += "  │ Trump control: " + (ts.trumpControl ? "YES" : "NO");
          text += " (opps void: " + ts.opponentsVoidInTrump;
          if(ts.partnersHaveTrump !== undefined) text += ", partners trump: " + ts.partnersHaveTrump;
          text += ")\n";
        }

        const vt = ts.voidTracking;
        if(vt && Object.keys(vt).length > 0){
          text += "  │ KNOWN VOIDS:\n";
          for(const [seat, info] of Object.entries(vt)){
            text += "  │   " + seat + " (" + info.team + "):";
            if(info.voidSuits && info.voidSuits.length > 0) text += " void in suits [" + info.voidSuits.join(",") + "]";
            if(!_noTrump){
              if(info.trumpVoidConfirmed) text += " | TRUMP VOID";
              else if(info.trumpVoidLikely > 0) text += " | trump void " + Math.round(info.trumpVoidLikely*100) + "%";
            }
            text += "\n";
          }
        } else {
          text += "  │ KNOWN VOIDS: none detected yet\n";
        }
        text += "  └────────────────────────\n";
      }
    }
    else if(entry.type === "HAND_END"){
      const scores = entry.finalScores || {};
      text += "\n  ====== HAND " + (entry.handId + 1) + " RESULT ======\n";
      text += "  Final: Team1=" + (scores.team1||0) + " Team2=" + (scores.team2||0) + "\n";
      text += "  " + (entry.winner || "") + "\n";
      text += "  Bid made: " + (entry.bidMade ? "Yes" : "No") + "\n";
    }
  }

  return text || 'No log entries yet.';
}

document.getElementById('menuGameLog').addEventListener('click', () => {
  document.getElementById('settingsMenu').classList.remove('open');
  refreshGameLogContent();
  document.getElementById('gameLogBackdrop').style.display = 'flex';
});

document.getElementById('gameLogCloseBtn').addEventListener('click', () => {
  document.getElementById('gameLogBackdrop').style.display = 'none';
});

document.getElementById('gameLogCopyBtn').addEventListener('click', () => {
  const text = _gameLogTab === 'hand' ? formatGameLogCurrentHand() : formatGameLog();
  navigator.clipboard.writeText(text).then(() => {
    document.getElementById('gameLogCopyBtn').textContent = 'Copied!';
    setTimeout(() => {
      document.getElementById('gameLogCopyBtn').textContent = 'Copy Log to Clipboard';
    }, 1500);
  }).catch(e => {
    console.error('Copy failed:', e);
  });
});

document.getElementById('gameLogClearBtn').addEventListener('click', () => {
  if(confirm('Clear all game log entries? Hand numbering will restart from 1.')){
    gameLog = [];
    handNumber = 0;
    trickNumber = 0;
    saveGameLog();
    document.getElementById('gameLogContent').textContent = 'Log cleared. Hand numbering will start from 1.';
  }
});

// ─── Current-hand log helpers ───
// Extract only entries from the most recent hand
function getCurrentHandEntries(){
  // Find the last HAND_START
  let lastHandIdx = -1;
  for(let i = gameLog.length - 1; i >= 0; i--){
    if(gameLog[i].type === 'HAND_START'){ lastHandIdx = i; break; }
  }
  if(lastHandIdx === -1) return [];
  return gameLog.slice(lastHandIdx);
}

function formatGameLogCurrentHand(){
  const entries = getCurrentHandEntries();
  if(entries.length === 0) return 'No current hand data.';
  let text = "=== CURRENT HAND LOG ===\n\n";
  for(const entry of entries){
    if(entry.type === "HAND_START"){
      text += `========== HAND ${entry.handId + 1} ==========\n`;
      const c = entry.contract || {};
      text += `  Dealer: P${seatToPlayer(entry.dealerSeat||0)} | Leader: P${seatToPlayer(entry.leaderSeat||0)}\n`;
      text += `  Contract: ${c.mode || "NORMAL"} | Trump: ${c.trumpDisplay || "?"} | Bid: ${c.bid || "?"}\n`;
      text += `  Bidder: P${seatToPlayer(c.bidderSeat||0)} (Team ${c.bidderTeam || "?"})\n`;
      const scores = entry.scoresBeforeHand || {};
      text += `  Scores Before: Team1=${scores.team1||0} Team2=${scores.team2||0}\n`;
      if(entry.hands){
        text += `  Starting Hands:\n`;
        for(const h of entry.hands){
          if(h.tiles && h.tiles.length > 0){
            text += `    P${seatToPlayer(h.seat)} (T${h.team}): ${h.tiles.join(", ")}\n`;
          }
        }
      }
    } else if(entry.type === "TRICK_START"){
      text += `\n  --- Trick ${entry.trickId + 1} ---\n`;
      text += `    Leader: P${seatToPlayer(entry.leaderSeat)} (Team ${entry.leaderTeam}) | Led pip: ${entry.ledPip !== null ? entry.ledPip : "?"}\n`;
    } else if(entry.type === "PLAY"){
      const actor = entry.isAISeat ? "[AI]" : "[Human]";
      text += `    P${seatToPlayer(entry.seat)} ${actor}: ${entry.tilePlayed}`;
      if(entry.aiReason) text += ` (${entry.aiReason})`;
      if(entry.wasOverride) text += ` [OVERRIDE! AI wanted: ${entry.aiSuggestedTile}]`;
      else if(!entry.isAISeat && entry.aiSuggestedTile) text += ` [AI agreed]`;
      if(entry.partnerCurrentlyWinning) text += ` [partner winning]`;
      text += "\n";
      if(entry.legalMoves && entry.legalMoves.length > 1) text += `      Legal: ${entry.legalMoves.join(", ")}\n`;
    } else if(entry.type === "TRICK_END"){
      text += `    >> Winner: P${seatToPlayer(entry.winnerSeat)} (Team ${entry.winnerTeam}) +${entry.pointsInTrick} pts\n`;
      text += `    >> Plays: ${entry.playsString}\n`;
    } else if(entry.type === "HAND_END"){
      const scores = entry.finalScores || {};
      text += `\n  ====== HAND ${entry.handId + 1} RESULT ======\n`;
      text += `  Final: Team1=${scores.team1||0} Team2=${scores.team2||0}\n`;
      text += `  ${entry.winner || ""}\n`;
      text += `  Bid made: ${entry.bidMade ? "Yes" : "No"}\n`;
    }
  }
  return text;
}

function formatAdvancedLogCurrentHand(){
  const entries = getCurrentHandEntries();
  if(entries.length === 0) return 'No current hand data.';
  // Reuse the full advanced formatter but only on current hand entries
  let text = "=== CURRENT HAND — ADVANCED AI DEBUG ===\n";
  text += "=== Generated: " + new Date().toISOString() + " ===\n\n";
  let _noTrump = false;
  for(const entry of entries){
    if(entry.type === "HAND_START"){
      const c = entry.contract || {};
      _noTrump = (c.mode === "NELLO" || c.mode === "NONE" || c.mode === "NO_TRUMP");
      text += "\n" + "=".repeat(70) + "\n";
      text += " HAND " + (entry.handId + 1) + "\n";
      text += "=".repeat(70) + "\n";
      text += "Contract: " + (c.mode||"NORMAL") + " | Trump: " + (c.trumpDisplay||"?");
      text += " | Bid: " + (c.bid||"?") + " by P" + seatToPlayer(c.bidderSeat||0);
      text += " (Team " + (c.bidderTeam||"?") + ")\n";
      const scores = entry.scoresBeforeHand || {};
      text += "Scores Before: Team1=" + (scores.team1||0) + " Team2=" + (scores.team2||0) + "\n";
      if(entry.hands){
        text += "Hands:\n";
        for(const h of entry.hands){
          if(h.tiles && h.tiles.length > 0) text += "  P" + seatToPlayer(h.seat) + " (T" + h.team + "): " + h.tiles.join(", ") + "\n";
        }
      }
    }
    else if(entry.type === "TRICK_START"){
      text += "\n--- Trick " + (entry.trickId + 1) + " ---\n";
      text += "  Leader: P" + seatToPlayer(entry.leaderSeat) + " (Team " + entry.leaderTeam + ")\n";
    }
    else if(entry.type === "PLAY"){
      const actor = entry.isAISeat ? "[AI]" : "[Human]";
      text += "\n  P" + seatToPlayer(entry.seat) + " " + actor + " plays: " + entry.tilePlayed;
      if(entry.aiReason) text += " — " + entry.aiReason;
      if(entry.wasOverride) text += " [OVERRIDE! AI wanted: " + entry.aiSuggestedTile + "]";
      text += "\n";
      if(entry.legalMoves && entry.legalMoves.length > 1) text += "    Legal moves: " + entry.legalMoves.join(", ") + "\n";
      const d = entry.aiDebug;
      if(d){
        text += "    \u250c\u2500\u2500\u2500 AI REASONING \u2500\u2500\u2500\n";
        text += "    \u2502 Seat: " + d.seat + " | Team: " + d.myTeam + " | Trick: " + d.trickNum;
        text += " | " + (d.isLead ? "LEADING" : "FOLLOWING (led pip: " + d.ledPip + ")") + "\n";
        text += "    \u2502 Hand: [" + (d.handTiles||[]).join(", ") + "]\n";
        text += "    \u2502 Legal: [" + (d.legalTiles||[]).join(", ") + "]\n";
        text += "    \u2502 Played tiles tracked: " + d.playedCount + "\n";
        if(d.trumpMode && d.trumpMode !== "NONE"){
          text += "    \u2502\n";
          text += "    \u2502 TRUMP: mode=" + d.trumpMode + " suit=" + d.trumpSuit + "\n";
          text += "    \u2502   In hand: [" + (d.trumpsInHand||[]).join(", ") + "]\n";
          text += "    \u2502   Remaining (not in hand): [" + (d.trumpsRemaining||[]).join(", ") + "]\n";
          text += "    \u2502   I have highest trump: " + d.iHaveHighestTrump;
          text += " (my rank: " + d.myHighestTrumpRank + " vs remaining: " + d.highestRemainingTrumpRank + ")\n";
        }
        if(d.voidTracking && Object.keys(d.voidTracking).length > 0){
          text += "    \u2502\n";
          text += "    \u2502 VOID TRACKING:\n";
          for(const [seat, info] of Object.entries(d.voidTracking)){
            if(info.voidSuits && info.voidSuits.length === 0 && !info.trumpVoidConfirmed && !(info.trumpVoidLikely > 0)){
              text += "    \u2502   " + seat + " (" + info.team + "): no voids detected\n";
            } else {
              text += "    \u2502   " + seat + " (" + info.team + "): void in suits [" + info.voidSuits.join(",") + "]";
              if(!_noTrump){
                if(info.trumpVoidConfirmed) text += " | TRUMP VOID (confirmed)";
                else if(info.trumpVoidLikely > 0) text += " | trump void likely (" + Math.round(info.trumpVoidLikely*100) + "%)";
              }
              text += "\n";
            }
          }
        }
        if(!_noTrump){
          text += "    \u2502\n";
          text += "    \u2502 TRUMP CONTROL: " + (d.weHaveTrumpControl ? "YES" : "NO");
          text += " (opps void: " + d.opponentsVoidInTrump + ", partners have trump: " + d.partnersHaveTrump + ")\n";
        }
        if(d.bidSafety){
          const b = d.bidSafety;
          text += "    \u2502 BID: " + b.currentBid + " | Our score: " + b.ourScore;
          text += " | Need: " + b.pointsNeeded + " | ";
          text += b.bidIsSafe ? "SAFE" : (b.bidIsClose ? "CLOSE!" : "still working");
          text += " | Tricks left: " + b.tricksLeft + "\n";
        }
        text += "    \u2502\n";
        text += "    \u2502 DECISION: " + (d.decision || d.chosenTile || "?") + "\n";
        text += "    \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n";
      }
    }
    else if(entry.type === "TRICK_END"){
      text += "  >> Winner: P" + seatToPlayer(entry.winnerSeat) + " (Team " + entry.winnerTeam + ") +" + entry.pointsInTrick + " pts\n";

      // End-of-trick state summary
      const ts = entry.trickEndState;
      if(ts){
        text += "  ┌─── END OF TRICK STATE ───\n";
        text += "  │ Scores: Team1=" + ts.teamScores[0] + " Team2=" + ts.teamScores[1] + "\n";

        if(ts.bidSafety){
          const b = ts.bidSafety;
          text += "  │ Bid: " + b.currentBid + " | Need: " + b.pointsNeeded + " | ";
          if(b.bidIsSafe) text += "SAFE";
          else if(b.bidIsClose) text += "CLOSE!";
          else text += "still working";
          text += " | Tricks left: " + b.tricksLeft + "\n";
        }

        if(!_noTrump){
          if(ts.trumpsInHand && ts.trumpsInHand.length > 0){
            text += "  │ P1 trumps: [" + ts.trumpsInHand.join(", ") + "]\n";
          }
          if(ts.trumpsRemaining && ts.trumpsRemaining.length > 0){
            text += "  │ Trumps still out: [" + ts.trumpsRemaining.join(", ") + "]\n";
          } else {
            text += "  │ Trumps still out: none (all accounted for)\n";
          }

          text += "  │ Trump control: " + (ts.trumpControl ? "YES" : "NO");
          text += " (opps void: " + ts.opponentsVoidInTrump;
          if(ts.partnersHaveTrump !== undefined) text += ", partners trump: " + ts.partnersHaveTrump;
          text += ")\n";
        }

        const vt = ts.voidTracking;
        if(vt && Object.keys(vt).length > 0){
          text += "  │ KNOWN VOIDS:\n";
          for(const [seat, info] of Object.entries(vt)){
            if(info.voidSuits && info.voidSuits.length === 0 && !info.trumpVoidConfirmed && !(info.trumpVoidLikely > 0)){
              text += "  │   " + seat + " (" + info.team + "): no voids detected\n";
            } else {
              text += "  │   " + seat + " (" + info.team + "):";
              if(info.voidSuits && info.voidSuits.length > 0) text += " void in suits [" + info.voidSuits.join(",") + "]";
              if(!_noTrump){
                if(info.trumpVoidConfirmed) text += " | TRUMP VOID";
                else if(info.trumpVoidLikely > 0) text += " | trump void " + Math.round(info.trumpVoidLikely*100) + "%";
              }
              text += "\n";
            }
          }
        } else {
          text += "  │ KNOWN VOIDS: none detected yet\n";
        }
        text += "  └────────────────────────\n";
      }
    }
    else if(entry.type === "HAND_END"){
      const scores = entry.finalScores || {};
      text += "\n" + "=".repeat(70) + "\n";
      text += "HAND " + (entry.handId+1) + " RESULT: Team1=" + (scores.team1||0) + " Team2=" + (scores.team2||0);
      text += " | " + (entry.winner||"") + " | Bid made: " + (entry.bidMade ? "Yes" : "No") + "\n";
      text += "=".repeat(70) + "\n";
    }
  }
  return text;
}

// Track which tab is active for each log
// _gameLogTab, _advLogTab declared in game.js stubs
_gameLogTab = 'full';
_advLogTab = 'full';

function refreshGameLogContent(){
  const content = _gameLogTab === 'hand' ? formatGameLogCurrentHand() : (formatGameLog() || 'No log entries yet.');
  document.getElementById('gameLogContent').textContent = content;
  // Tab styling
  document.getElementById('gameLogTabFull').style.background = _gameLogTab === 'full' ? 'rgba(255,255,255,0.15)' : 'transparent';
  document.getElementById('gameLogTabFull').style.color = _gameLogTab === 'full' ? '#fff' : 'rgba(255,255,255,0.5)';
  document.getElementById('gameLogTabHand').style.background = _gameLogTab === 'hand' ? 'rgba(255,255,255,0.15)' : 'transparent';
  document.getElementById('gameLogTabHand').style.color = _gameLogTab === 'hand' ? '#fff' : 'rgba(255,255,255,0.5)';
}

function refreshAdvLogContent(){
  const content = _advLogTab === 'hand' ? formatAdvancedLogCurrentHand() : (formatAdvancedLog() || 'No log entries yet.');
  document.getElementById('advLogContent').textContent = content;
  document.getElementById('advLogTabFull').style.background = _advLogTab === 'full' ? 'rgba(255,255,255,0.15)' : 'transparent';
  document.getElementById('advLogTabFull').style.color = _advLogTab === 'full' ? '#fff' : 'rgba(255,255,255,0.5)';
  document.getElementById('advLogTabHand').style.background = _advLogTab === 'hand' ? 'rgba(255,255,255,0.15)' : 'transparent';
  document.getElementById('advLogTabHand').style.color = _advLogTab === 'hand' ? '#fff' : 'rgba(255,255,255,0.5)';
}

// Tab click handlers
document.getElementById('gameLogTabFull').addEventListener('click', () => { _gameLogTab = 'full'; refreshGameLogContent(); });
document.getElementById('gameLogTabHand').addEventListener('click', () => { _gameLogTab = 'hand'; refreshGameLogContent(); });
document.getElementById('advLogTabFull').addEventListener('click', () => { _advLogTab = 'full'; refreshAdvLogContent(); });
document.getElementById('advLogTabHand').addEventListener('click', () => { _advLogTab = 'hand'; refreshAdvLogContent(); });

// Advanced AI Log handlers
document.getElementById('menuAdvancedLog').addEventListener('click', () => {
  document.getElementById('settingsMenu').classList.remove('open');
  refreshAdvLogContent();
  document.getElementById('advLogBackdrop').style.display = 'flex';
});

document.getElementById('advLogCloseBtn').addEventListener('click', () => {
  document.getElementById('advLogBackdrop').style.display = 'none';
});

document.getElementById('advLogCopyBtn').addEventListener('click', () => {
  const text = _advLogTab === 'hand' ? formatAdvancedLogCurrentHand() : formatAdvancedLog();
  navigator.clipboard.writeText(text).then(() => {
    document.getElementById('advLogCopyBtn').textContent = 'Copied!';
    setTimeout(() => {
      document.getElementById('advLogCopyBtn').textContent = 'Copy to Clipboard';
    }, 1500);
  }).catch(e => {
    console.error('Copy failed:', e);
  });
});

document.getElementById('advLogDownloadBtn').addEventListener('click', () => {
  const text = _advLogTab === 'hand' ? formatAdvancedLogCurrentHand() : formatAdvancedLog();
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tn51_ai_debug_' + new Date().toISOString().slice(0,10) + '.txt';
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('advLogClearBtn').addEventListener('click', () => {
  if(confirm('Clear all log entries? Hand numbering will restart from 1.')){
    gameLog = [];
    handNumber = 0;
    trickNumber = 0;
    saveGameLog();
    document.getElementById('advLogContent').textContent = 'Log cleared. Hand numbering will start from 1.';
  }
});




// V12: Screen name is now inline on start screen — no popup needed
// updateScreenNameUI() is called in the IIFE above

// v14.0.2: game.js ran the stub versions of these at startup; run the real ones now
loadGameLog();
checkForSavedGame();

// Show start screen on load
showStartScreen();

// Service Worker registration moved to index.html (always loads, not lazy)

