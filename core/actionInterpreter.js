export class ActionInterpreter {
  interpret(text, core){
    const t=text.trim().toLowerCase();
    const loc=core.state.location;
    if(!t) return {text:"Du zögerst. Die Welt wartet nicht ewig.",kind:"neutral"};

    const has=(...w)=>w.some(x=>t.includes(x));
    if(has("status","inventar")) return {text:`Du trägst bei dir: ${core.state.inventory.join(", ")}.`,kind:"info"};

    if(loc==="ship_bridge"){
      if(has("station","helios","andocken","dock")) { core.travel("helios_docks"); return {text:"Die Wayfarer gleitet in den Dockring von Helios-9. Magnetklammern greifen den Rumpf. Die Schleuse öffnet sich.",kind:"success"}; }
      if(has("artefakt","untersuche","scanne","scan")) {
        const c=core.check("intelligence",12, core.state.player?.positiveTraits?.includes("tech_genius")?2:0);
        core.state.flags.artifactAwake=c.success;
        if(c.success){ core.state.flags.knowsEcho=true; core.remember("Das Artefakt antwortete auf einen Scan, bevor der Befehl vollständig gesendet war.",85); return {text:`W20 ${c.roll} · Erfolg. Das Artefakt pulsiert. Für 0,7 Sekunden zeigt die Sensorik einen Messwert an, der erst im nächsten Scan entstehen dürfte. Auf deinem Display erscheint ein Wort: ECHO.`,kind:"success",check:c}; }
        return {text:`W20 ${c.roll} · Fehlschlag. Der Scanner bricht mit einer Synchronisationswarnung ab. Das Artefakt bleibt still – aber du bist dir sicher, dass es eben warm geworden ist.`,kind:"fail",check:c};
      }
      if(has("korridor","maschinenraum","verlasse brücke")){ core.travel("ship_corridor"); return {text:"Die Tür der Brücke schließt sich hinter dir. Das Mitteldeck riecht nach Metall, Kühlmittel und einem Reaktor, der bessere Tage gesehen hat.",kind:"success"}; }
    }

    if(loc==="ship_corridor"){
      if(has("brücke","zurück")){ core.travel("ship_bridge"); return {text:"Du kehrst auf die Brücke zurück.",kind:"success"}; }
      if(has("repar","leitung","maschinen")){
        const c=core.check("tech",11, core.state.player?.positiveTraits?.includes("tech_genius")?2:0);
        if(c.success){ core.state.shield=Math.min(100,core.state.shield+10); return {text:`W20 ${c.roll} · Erfolg. Du überbrückst einen instabilen Energiekoppler. Die Schildreserve steigt auf ${core.state.shield}%.`,kind:"success",check:c}; }
        core.state.hp=Math.max(1,core.state.hp-3); return {text:`W20 ${c.roll} · Fehlschlag. Ein Lichtbogen erwischt deinen Handschuh. -3 Gesundheit.`,kind:"fail",check:c};
      }
    }

    if(loc==="helios_docks"){
      if(has("bar","last light","informant","kael")){ core.travel("helios_bar"); return {text:"Du folgst den Leuchtschildern durch den Dockring bis zum Last Light. Dein Informant Kael sollte hier sein.",kind:"success"}; }
      if(has("schiff","wayfarer","zurück")){ core.travel("ship_bridge"); return {text:"Du kehrst durch die Schleuse auf die Wayfarer zurück.",kind:"success"}; }
    }

    if(loc==="helios_bar"){
      if(!core.state.flags.metKael){
        core.state.flags.metKael=true;
        core.remember("Kael Voss wurde im Last Light von drei Söldnern bedroht.",70);
      }
      if(has("einschüchter","droh","waffe","pistole")){
        let bonus=core.state.player?.background==="pirate"?2:0;
        if(core.state.player?.positiveTraits?.includes("silver_tongue")) bonus+=1;
        if(core.state.player?.negativeTrait==="hothead") bonus-=1;
        const c=core.check("charisma",13,bonus);
        if(c.success){ core.state.reputation.crimson+=2; core.remember("Der Spieler brachte Söldner im Last Light ohne Schusswechsel zum Rückzug.",75); return {text:`W20 ${c.roll} · Erfolg. Du legst die Hand sichtbar an deine Pistole und hältst den Blick des Anführers. Nach einigen Sekunden flucht er leise. „Heute nicht.“ Die drei ziehen ab. Kael hebt überrascht eine Braue.`,kind:"success",check:c}; }
        core.state.hp-=8; return {text:`W20 ${c.roll} · Fehlschlag. Der Söldner lässt sich nicht beeindrucken. Ein kurzer Schlagabtausch endet mit einem Kolbenstoß gegen deine Rippen. -8 Gesundheit. Kael nutzt das Chaos, um hinter die Bar zu springen.`,kind:"fail",check:c};
      }
      if(has("reden","verhand","credits","bezahlen","angebot")){
        const c=core.check("charisma",11,core.state.player?.positiveTraits?.includes("silver_tongue")?2:0);
        if(c.success){ core.state.credits-=Math.min(core.state.credits,100); core.remember("Der Spieler löste den Konflikt im Last Light durch Verhandlung.",60); return {text:`W20 ${c.roll} · Erfolg. Hundert Credits und ein überzeugender Ton reichen. Die Söldner verschwinden. Kael setzt sich wieder. „Du hast Talent, Probleme teuer statt blutig zu lösen.“`,kind:"success",check:c}; }
        return {text:`W20 ${c.roll} · Fehlschlag. Dein Angebot beleidigt sie eher. Einer lacht: „Du weißt nicht, worum es hier geht.“`,kind:"fail",check:c};
      }
      if(has("wartung","toilette","schleich","hinter")){
        const c=core.check("reflexes",12,core.state.player?.background==="agent"?1:0);
        if(c.success){ core.remember("Der Spieler umging die Söldner im Last Light durch einen Wartungsschacht.",65); return {text:`W20 ${c.roll} · Erfolg. Der Wartungsschacht ist eng, aber offen. Du kommst hinter Kaels Sitzplatz heraus. Er erkennt dich sofort und schiebt dir wortlos einen Datenchip zu.`,kind:"success",check:c}; }
        return {text:`W20 ${c.roll} · Fehlschlag. Eine lose Abdeckung kracht zu Boden. Die drei Söldner drehen sich gleichzeitig zu dir um.`,kind:"fail",check:c};
      }
      if(has("datenchip","echo","artefakt","frage")){
        core.state.flags.knowsEcho=true; core.travel("ruins_gate"); core.remember("Kael gab Koordinaten zu einer Architektenruine auf Nereid IV.",90);
        return {text:"Kael zeigt auf den Datenchip. „Nereid IV. Eine Ruine, die seit sechshundert Jahren tot war. Vor drei Tagen hat sie begonnen, dein Signal zu senden.“ Stunden später setzt die Wayfarer auf dem violetten Staubmond auf.",kind:"success"};
      }
    }

    if(loc==="ruins_gate"){
      if(has("berühr","tor","artefakt","öffne","öffnen")){
        const c=core.check("willpower",14,core.state.player?.background==="voidborn"?2:0);
        if(c.success){ core.remember("Der Spieler öffnete das Tor der Architektenruine und hörte eine Stimme aus der eigenen Erinnerung.",100); return {text:`W20 ${c.roll} · Erfolg. Als du das Artefakt an die schwarze Wand hältst, verschwindet jedes Geräusch. Dann hörst du deine eigene Stimme – Jahre jünger – einen Satz sagen, den du nie laut ausgesprochen hast: „Wir waren nicht die Ersten.“ Das Tor öffnet sich. ENDE DES VERTICAL SLICE.`,kind:"success",check:c,ending:true}; }
        return {text:`W20 ${c.roll} · Fehlschlag. Die Lichtadern schießen deinen Arm hinauf. Du reißt dich los. Hinter dem Tor bewegt sich etwas, obwohl dort laut Scan kein Raum existiert.`,kind:"fail",check:c};
      }
    }

    const generic=core.check("perception",10,0);
    return {text:generic.success?`Du versuchst: „${text}“. Die Umgebung reagiert nicht eindeutig, aber dir fällt ein Detail auf: Hier gibt es wahrscheinlich einen sinnvolleren, konkreteren Ansatz.`:`Du versuchst: „${text}“. Nichts Entscheidendes passiert.`,kind:"neutral",check:generic};
  }
}
