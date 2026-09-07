const DICT={
  observe:['schau','schaue','beobacht','untersuch','prüf','scan','analys','anseh','such','inspizier','mustere'],
  talk:['rede','sprich','sag','frage','erzähl','verhandel','überzeug','lüg','behaupt','droh','einschüchter','bitte'],
  attack:['schieß','schies','greif','angreif','schlag','trete','werfe granate','feuer','zücke','ziehe meine pistole'],
  sneak:['schleich','versteck','unbemerkt','wartungsschacht','kriech','umgeh','hinterrücks'],
  hack:['hack','terminal','code','zugangssystem','überbrück','datenbank'],
  repair:['repar','flick','koppler','leitung','reaktor','wartung'],
  travel:['gehe','geh ','laufe','betrete','fliege','dock','andock','zurück','brücke','maschinenraum','quartier','krankenstation','frachtraum','luftschleuse','promenade','markt','bar','last light','nereid','ruine'],
  use:['benutze','nutze','setze','verwende','aktiviere','berühre','halte','öffne'],
  buy:['kaufe','kaufen','bezahle','credits','preis','händler'],
  rest:['ruhe','schlafe','ausruhen','pause'],
  heal:['heile','behandle','medkit','autodoc'],
  flee:['fliehe','renne weg','ziehe mich zurück','rückzug']
};

function norm(s){return s.toLowerCase().replace(/[ä]/g,'ae').replace(/[ö]/g,'oe').replace(/[ü]/g,'ue').replace(/ß/g,'ss');}
function hasAny(t,list){return list.some(x=>t.includes(norm(x)));}
function esc(s){return String(s).replace(/[<>]/g,'');}

export class ActionInterpreter{
  parse(text,core){
    const raw=text.trim();const t=norm(raw);const intents=[];
    for(const [k,words] of Object.entries(DICT))if(hasAny(t,words))intents.push(k);
    const tone=hasAny(t,['bitte','ruhig','freundlich','höflich'])?'calm':hasAny(t,['droh','waffe','erschieß','letzte chance','einschüchter'])?'threatening':hasAny(t,['lüg','tue so','behaupte','täusche'])?'deceptive':'neutral';
    const targets=[];for(const x of ['artefakt','kael','soeldner','soldner','terminal','tor','glyph','reaktor','koppler','schiff','wache','sicherheit','datenchip'])if(t.includes(norm(x)))targets.push(x);
    const quoted=(raw.match(/[„\"]([^”\"]+)[”\"]/)||[])[1]||null;
    return {raw,t,intents,tone,targets,quoted,words:raw.split(/\s+/).length,complexity:Math.min(3,Math.max(1,intents.length))};
  }

  interpret(text,core){
    if(!text.trim())return this.out('Du sagst nichts. Für einen Moment hörst du nur das ferne Summen der Systeme. Die Situation bleibt bestehen – und mit ihr das Gefühl, dass Untätigkeit irgendwann ebenfalls eine Entscheidung wird.','neutral');
    const a=this.parse(text,core);
    a.repeatCount=core.repeatCount(a.raw);
    core.state.currentActionRepeat=a.repeatCount;
    core.advanceTurn();core.recordAction(a);core.pushLog(a.raw);
    if(a.repeatCount>0)return this.finish(this.repeatedAttempt(a,core),a,core);
    const loc=core.state.location;
    const handler=this[`at_${loc}`];if(handler){const r=handler.call(this,a,core);if(r)return this.finish(r,a,core);}
    const movement=this.tryTravel(a,core);if(movement)return this.finish(movement,a,core);
    return this.finish(this.generic(a,core),a,core);
  }

  out(text,kind='neutral',check=null,meta={}){return {text,kind,check,...meta};}

  pick(list,core){return list[core.randomInt(0,list.length-1)];}

  repeatedAttempt(a,core){
    const loc=core.location();
    let stat='perception',tags=['observation'],base=11;
    if(a.intents.includes('talk')){stat='charisma';tags=a.tone==='threatening'?['intimidation']:a.tone==='deceptive'?['deception']:['persuasion'];base=12;}
    else if(a.intents.includes('attack')){stat='combat';tags=['combat'];base=14;}
    else if(a.intents.includes('hack')||a.intents.includes('repair')){stat='tech';tags=['hacking','repair','engineering'];base=12;}
    else if(a.intents.includes('sneak')){stat='reflexes';tags=['stealth'];base=12;}
    else if(a.intents.includes('use')){stat='intelligence';tags=['analysis','improvise'];base=12;}
    const c=core.check(stat,base,tags);
    const n=a.repeatCount+1;
    const openings=[
      `Du setzt denselben Plan ein weiteres Mal an. Beim **${n}. Versuch** ist die Ausgangslage jedoch nicht mehr dieselbe.`,
      `Du wiederholst deine Handlung fast wortgleich. Diesmal erkennst du schon beim Ansatz, welche Details sich seit dem letzten Versuch verschoben haben.`,
      `Noch einmal: **${esc(a.raw)}**. Aber Wiederholung bedeutet hier nicht Zurückspulen – die Welt hat den vorherigen Versuch bereits erlebt.`
    ];
    const successes=[
      `Diesmal findest du den Moment, der dir zuvor gefehlt hat. Eine kleine Lücke öffnet sich, und aus dem alten Plan entsteht tatsächlich ein neuer Vorteil.`,
      `Der bekannte Ablauf hilft dir, schneller zu reagieren. Du korrigierst genau das Detail, das beim letzten Mal gestört hat, und kommst diesmal weiter.`,
      `Gerade weil du den Ansatz kennst, bemerkst du eine Abweichung. Du nutzt sie sofort – und die Situation antwortet anders als zuvor.`
    ];
    const failures=[
      `Der wiederholte Ansatz wird erkannt. Was vorher noch Überraschung erzeugte, trifft jetzt auf vorbereiteten Widerstand.`,
      `Du erreichst denselben kritischen Punkt wie zuvor, aber diesmal kippt die Lage früher. Die Umgebung hat sich auf dieses Muster eingestellt.`,
      `Der Plan ist nicht sinnlos, nur verbraucht. Die Reaktion kommt schneller als beim letzten Mal und zwingt dich, den nächsten Schritt neu zu denken.`
    ];
    const worldChanges=[
      `In ${loc.name} verändert sich währenddessen etwas Kleines, aber Reales: ${this.pick(loc.affordances||['ein neuer Blickwinkel wird sichtbar'],core)}.`,
      `Du bemerkst nebenbei, dass **${this.pick(loc.affordances||['die unmittelbare Umgebung'],core)}** inzwischen anders auf deine Präsenz wirkt.`,
      `Der Ort bleibt nicht stehen. **${this.pick(loc.affordances||['eine neue Möglichkeit'],core)}** rückt stärker in den Vordergrund als noch vor einem Zug.`
    ];
    return this.out(`${this.rollLine(c)}\n\n${this.pick(openings,core)}\n\n${c.success?this.pick(successes,core):this.pick(failures,core)}\n\n${this.pick(worldChanges,core)}`,c.success?'success':'fail',c,{repeated:true});
  }

  finish(result,a,core){
    const loc=core.location();
    const sceneBeats={
      ship:[
        'Unter deinen Stiefeln läuft ein kaum merkliches Zittern durch das Deck, als die Wayfarer ihre Leistung nachregelt.',
        'Irgendwo hinter der Wand klackt ein Relais zweimal; danach bleibt nur das tiefe Summen des Reaktors.',
        'Auf der Frontscheibe ziehen kalte Positionslichter vorbei und werfen für einen Moment lange Schatten über die Konsolen.'
      ],
      station:[
        'Aus einem entfernten Korridor schwappt Stationslärm herüber: Schritte, eine Lautsprecherdurchsage, dann das Zischen eines Druckschotts.',
        'Über dir flackert eine Werbetafel, während zwei Passanten ihr Gespräch abbrechen und einen kurzen Blick in deine Richtung werfen.',
        'Die Luft riecht nach Ozondunst, heißem Metall und dem viel zu starken Gewürz eines nahen Garkiosks.'
      ],
      bar:[
        'Hinter der Bar stellt jemand ein Glas etwas zu hart ab. Für einen Augenblick scheint der ganze Raum zuzuhören.',
        'Eine Basslinie vibriert durch den Boden, doch an eurem Tisch ist die Stille plötzlich deutlicher als die Musik.',
        'Am Nebentisch rückt ein Stuhl. Niemand sieht offen her, aber mehrere Leute hören sehr genau zu.'
      ],
      planet:[
        'Violetter Staub zieht in dünnen Fahnen über den Boden und sammelt sich an den Kanten deines Anzugs.',
        'Der Wind fährt durch die Ebene, ohne ein vertrautes Geräusch zu erzeugen; nur dein Atem bleibt als Rhythmus im Helm.',
        'Weit über dir wandert ein blasser Mond durch den Himmel, während die Ruinen mit einem kaum sichtbaren Licht antworten.'
      ],
      ruins:[
        'Die Lichtadern in den Wänden verändern ihre Helligkeit, als hätten sie deine Handlung registriert.',
        'Für einen Moment ist da ein Ton knapp unterhalb dessen, was du bewusst hören kannst – eher Druck als Klang.',
        'Dein Schatten liegt falsch auf dem Boden. Nur um wenige Zentimeter, aber genug, dass du es bemerkst.'
      ]
    };
    const key=sceneBeats[loc?.type]?loc.type:(String(loc?.type||'').includes('ship')?'ship':String(loc?.type||'').includes('station')?'station':String(loc?.type||'').includes('ruin')?'ruins':null);
    const beat=key?this.pick(sceneBeats[key],core):'';
    let reaction='';
    if(a.repeatCount>0){
      const repeats=[
        `Du hast denselben Ansatz hier bereits ${a.repeatCount}× versucht. Die Umgebung ist nicht statisch: Beobachter kennen inzwischen dein Muster und reagieren schneller darauf.`,
        `Der Versuch kommt dir bekannt vor – und offenbar nicht nur dir. Nach ${a.repeatCount} früheren Anläufen wirkt die Situation angespannter; dieselbe Methode zieht inzwischen andere Aufmerksamkeit auf sich.`,
        `Zum ${a.repeatCount+1}. Mal gehst du mit nahezu demselben Plan vor. Was beim ersten Versuch überraschend war, ist jetzt berechenbarer geworden. Die Welt merkt sich das.`
      ];
      reaction=this.pick(repeats,core);
    } else {
      const acknowledgements=[
        `Du setzt nicht irgendeine Standardaktion um, sondern genau den Kern deiner Idee: **${esc(a.raw)}**`,
        `Deine Absicht ist eindeutig genug, dass die Situation auf deine konkrete Formulierung reagiert: **${esc(a.raw)}**`,
        `Du gehst den Moment auf deine Weise an – mit dem Plan, den du beschrieben hast: **${esc(a.raw)}**`
      ];
      reaction=this.pick(acknowledgements,core);
    }
    result.text=`${result.text}\n\n${beat}${beat?'\n\n':''}${reaction}`;
    core.state.lastPlayerInput=a.raw;
    core.state.lastNarrative=result.text;
    return result;
  }
  rollLine(c){const label={critical:'KRITISCHER ERFOLG',strong:'DEUTLICHER ERFOLG',success:'ERFOLG',fail:'FEHLSCHLAG',bad:'SCHWERER FEHLSCHLAG',fumble:'PATZER'}[c.degree];return `${label} · W20 ${c.roll} + ${c.mod} = ${c.total} gegen SG ${c.difficulty}`;}

  tryTravel(a,core){
    if(!a.intents.includes('travel'))return null; const t=a.t;
    const map=[
      [['maschinenraum','engineering'],'ship_engineering'],[['quartier'],'ship_quarters'],[['krankenstation','medbay'],'ship_medbay'],[['frachtraum','cargo'],'ship_cargo'],[['luftschleuse'],'ship_airlock'],
      [['bruecke','brücke'],'ship_bridge'],[['promenade'],'helios_promenade'],[['schattenmarkt','markt'],'helios_market'],[['last light','bar'],'helios_bar'],[['sicherheit'],'helios_security'],[['dockring','dock'],'helios_docks'],[['ruine','nereid'],'nereid_surface']
    ];
    for(const [keys,id] of map){if(keys.some(k=>t.includes(norm(k)))){if(id==='nereid_surface'&&!core.state.flags.nereidUnlocked)continue;if(core.travel(id))return this.out(this.arrival(core,id),'success',null,{travel:true});}}
    if(t.includes('zurueck')||t.includes('zurück')){const prev=core.state.previousLocation;if(prev&&core.travel(prev))return this.out(this.arrival(core,prev),'success',null,{travel:true});}
    return null;
  }

  arrival(core,id){const l=core.data.world.locations[id];const extras={ship_bridge:'Die Schotts gleiten hinter dir zu. Auf der Hauptkonsole wartet das Artefakt noch immer wie ein dunkler Splitter, der nicht in diese Zeit gehört.',ship_engineering:'Hitze schlägt dir entgegen. Der instabile Koppler knistert deutlich lauter als zuvor.',helios_bar:'Mit dem Öffnen der Tür verschluckt das Last Light für einen Herzschlag seine Gespräche. Kael sitzt noch immer hinten; die drei Söldner bemerken dich sofort.',nereid_surface:'Die Wayfarer setzt auf der Ebene auf. Als die Rampe sinkt, kriecht violetter Staub über das Metall und das Artefakt beginnt unter deiner Kleidung zu pulsieren.'};return `${l.desc}\n\n${extras[id]||'Du nimmst dir einen Moment, um die neue Umgebung und mögliche Wege in Ruhe zu erfassen.'}`;}

  at_ship_bridge(a,core){
    if(a.targets.includes('artefakt')&&(a.intents.includes('observe')||a.intents.includes('use')||a.intents.includes('hack'))){
      const stat=a.intents.includes('hack')?'tech':'intelligence';const tags=a.intents.includes('hack')?['hacking','ancient_tech']:['analysis','science','ancient_tech'];const c=core.check(stat,13,tags);
      if(c.success){core.state.flags.artifactAwake=true;core.state.flags.knowsEcho=true;core.state.flags.nereidUnlocked=true;core.remember('Das Artefakt reagierte auf eine Untersuchung, bevor der eigentliche Befehl vollständig ausgeführt war.',90,'echo');core.setQuest('main_echo',{stage:1});core.setObjectives('main_echo',['Finde Kael Voss im Last Light auf Helios-9 und frage ihn nach dem Signal.']);
        return this.out(`${this.rollLine(c)}\n\nDu richtest die Sensoren auf das Artefakt und zwingst die Wayfarer, jede verwertbare Messspur festzuhalten. Zunächst kommt nur Rauschen. Dann springt die Anzeige für weniger als eine Sekunde auf einen Messwert, der laut Zeitstempel erst **0,7 Sekunden in der Zukunft** entstehen dürfte.\n\nNoch bevor du den nächsten Scan startest, zeichnet sich auf dem schwarzen Material eine haarfeine Linie aus Licht ab. Auf der Konsole erscheint ein einziges Wort – nicht aus deiner Datenbank, sondern in deinem persönlichen Interface-Profil: **ECHO**. Fast gleichzeitig blinkt eine alte Nachricht von Helios-9 auf. Absender: **Kael Voss**. Text: „Wenn du das Ding gefunden hast, komm allein.“`,'success',c);
      }
      return this.out(`${this.rollLine(c)}\n\nDu gehst systematisch vor, doch jedes Messverfahren endet anders: Spektrometer, Massenscan, Magnetfeldanalyse – keine zwei Werte passen zusammen. Schließlich meldet die Konsole einen Synchronisationsfehler und friert ein.\n\nAls du den Scanner abschaltest, merkst du etwas Beunruhigenderes als jeden Messwert: Das Artefakt ist warm geworden. Nur für einen Moment. Und obwohl du keinen Ton gehört hast, bist du dir sicher, dass irgendetwas auf der Brücke gerade auf deine Aufmerksamkeit reagiert hat.`,'fail',c);
    }
    if(a.intents.includes('observe')&&a.targets.includes('schiff')){return this.out('Du rufst die Diagnose der Wayfarer auf. Der alte Kreuzer hält sich besser, als sein Äußeres vermuten lässt, aber der Reaktor arbeitet unruhig und die Schildreserve hängt an einem instabilen Energiekoppler im Maschinenraum. Auf dem Navigationsdisplay wartet weiterhin die Dockfreigabe für Helios-9.\n\nEs ist kein unmittelbarer Notfall – noch nicht. Aber die Wayfarer erinnert dich mit jedem leisen Vibrieren daran, dass sie eher durch Pflege als durch Glück am Leben bleibt.','info');}
    if((a.t.includes('helios')||a.t.includes('andock')||a.t.includes('dock'))&&a.intents.includes('travel')){core.forceTravel('helios_docks');return this.out('Du bestätigst die Dockfreigabe. Die Wayfarer dreht sich schwerfällig in den Anflugkorridor von Helios-9, während Positionslichter über die Frontscheibe wandern. Kurz vor dem Ring greifen automatische Leitstrahlen nach dem Schiff.\n\nMit einem dumpfen Schlag schließen die Magnetklammern. Jenseits der Schleuse wartet eine Station voller Händler, Söldner, Behörden – und irgendwo darin Kael Voss, der offenbar mehr über dein Artefakt weiß, als dir lieb ist.','success',null,{travel:true});}
  }

  at_ship_engineering(a,core){
    if(a.intents.includes('repair')||a.t.includes('koppler')){const c=core.check('tech',12,['repair','engineering','improvise']);if(c.success){core.state.ship.reactorStability=Math.min(100,core.state.ship.reactorStability+18);core.state.shield=Math.min(100,core.state.shield+15);core.state.ship.shield=core.state.shield;core.setQuest('side_engine',{stage:1,status:'completed'});core.setObjectives('side_engine',['Energiekoppler stabilisiert.']);core.remember('Du hast den instabilen Energiekoppler der Wayfarer dauerhaft stabilisiert.',50,'ship');return this.out(`${this.rollLine(c)}\n\nDu trennst die Reserveleitung, öffnest den Koppler und findest die Ursache: eine halb verschmolzene Kontaktbrücke, die bei jeder Lastspitze einen Teil der Energie ins Gehäuse ableitet. Mit dem Multitool fräst du den beschädigten Abschnitt frei und setzt eine improvisierte Bypass-Schiene.\n\nAls du die Leitung wieder zuschaltest, verstummt das Knistern. Die Anzeigen klettern in den grünen Bereich. Die Wayfarer wirkt nicht plötzlich neu – aber zum ersten Mal seit Tagen klingt ihr Reaktor nicht so, als würde er dir etwas verschweigen.`,'success',c);}
      core.damage(5);core.state.ship.reactorStability=Math.max(20,core.state.ship.reactorStability-5);return this.out(`${this.rollLine(c)}\n\nDu öffnest die Verkleidung genau in dem Moment, in dem der Koppler erneut unter Last gerät. Ein weißer Lichtbogen springt über das Werkzeug und schlägt in deinen Unterarm. Der Geruch nach verbranntem Isoliermaterial füllt den Raum.\n\nDu bekommst das System rechtzeitig wieder geschlossen, aber deine Hand zittert und die Diagnose ist schlechter als zuvor. **5 Gesundheit verloren.** Der Schaden ist reparierbar – nur nicht mit derselben Methode.`,'fail',c);}
  }

  at_ship_medbay(a,core){if(a.intents.includes('heal')||a.intents.includes('rest')){if(core.state.hp>=100)return this.out('Der Autodoc findet nichts, was über ein paar alte Narben hinaus behandlungsbedürftig wäre. Seine sterile Stimme empfiehlt Schlaf, Wasser und weniger Entscheidungen unter Beschuss.','info');const before=core.state.hp;core.heal(25);return this.out(`Du legst dich auf die Medliege und lässt den Autodoc arbeiten. Kaltes Gel schließt kleinere Verletzungen, ein Injektor stabilisiert den Kreislauf und für einige Minuten zwingt dich die Maschine zur Ruhe.\n\nAls die Haltebügel sich lösen, ist der Schmerz deutlich dumpfer. **Gesundheit ${before}% → ${core.state.hp}%**. Die Reserven des Autodocs reichen noch, aber nicht unbegrenzt.`,'success');}}

  at_ship_quarters(a,core){if(a.intents.includes('rest')){core.heal(10);return this.out('Du dimmst die Beleuchtung und legst dich hin, ohne wirklich zu schlafen. Durch die dünne Wand spürst du den Reaktor der Wayfarer wie einen zweiten Herzschlag.\n\nNach einer Weile ist dein Kopf klarer und die Anspannung lässt nach. **10 Gesundheit regeneriert.** Das Artefakt lässt dich trotzdem nicht ganz zur Ruhe kommen; mehr als einmal glaubst du, ein leises Klicken aus Richtung Frachtraum zu hören.','success');}}

  at_ship_cargo(a,core){if(a.intents.includes('observe')||a.t.includes('kiste')){const c=core.check('perception',10,['observation','salvage']);if(c.success){return this.out(`${this.rollLine(c)}\n\nDu gehst die Kiste noch einmal sorgfältig durch. Unter der ursprünglichen Halterung findest du eine zweite, fast unsichtbare Vertiefung. Darin klebt ein abgerissenes Fragment eines Frachtlabels: **NEREID IV / ARCHIVE MATERIAL / HELIX RESTRICTED**.\n\nDas Artefakt war also nicht bloß Zufallsbeute. Jemand hatte es bereits katalogisiert – und jemand anderes wollte offenbar verhindern, dass diese Spur erhalten bleibt.`,'success',c);}return this.out(`${this.rollLine(c)}\n\nDu findest alte Polsterung, geschmolzene Halteklammern und Spuren einer gewaltsamen Öffnung. Nichts davon erklärt, woher das Artefakt kam. Gerade als du die Kiste schließen willst, hörst du ein kurzes metallisches Ticken aus dem Inneren – doch beim zweiten Hinsehen ist wieder alles still.`,'neutral',c);}}

  at_helios_docks(a,core){
    if(a.intents.includes('observe')){const c=core.check('perception',11,['observation','streetwise']);return c.success?this.out(`${this.rollLine(c)}\n\nDu bleibst einen Moment im Strom der Reisenden stehen, ohne wie jemand auszusehen, der stehen bleibt. Zwei Stationswachen kontrollieren vor allem Frachtercrews; ein ziviler Scanner sucht nach offenen Haftbefehlen. Weiter hinten weist eine flackernde Reklame zum **Last Light**.\n\nAußerdem fällt dir ein Mann im grauen Mantel auf, der scheinbar auf einen Gepäckdrohnen-Konvoi wartet. Sein Blick wandert jedoch immer wieder zur Wayfarer. Als du ihn direkt ansiehst, dreht er sich weg.`,'success',c):this.out(`${this.rollLine(c)}\n\nDer Dockring ist laut, voll und absichtlich unübersichtlich. Du erkennst die üblichen Dinge – Zoll, Händler, Wartungscrews – aber nichts, das eindeutig mit Kael oder dem Artefakt zusammenhängt. Wenn dich jemand beobachtet, macht er es gut.`,'neutral',c);}
  }

  at_helios_market(a,core){if(a.intents.includes('buy')||a.intents.includes('talk')){const c=core.check('charisma',11,['trade','negotiation','persuasion']);if(c.success){core.addCredits(-120);core.addItem('salvage_parts');return this.out(`${this.rollLine(c)}\n\nDu handelst mit einer Händlerin, deren linkes Auge Preise schneller einzublenden scheint, als sie sie ausspricht. Nach einigen Minuten fallen aus „unverhandelbaren“ 190 Credits plötzlich 120.\n\nDu erhältst einen Satz **Bergungskomponenten** – nicht glamourös, aber genau die Art Material, mit der man auf der Wayfarer Dinge repariert, die offiziell längst ersetzt werden müssten.`,'success',c);}return this.out(`${this.rollLine(c)}\n\nDer Händler hört sich dein Angebot an, lächelt und nennt anschließend einen noch höheren Preis. Entweder hat er deine Unsicherheit bemerkt oder er hält dich für reich genug, sie sich leisten zu können. Du gehst ohne Geschäft.`,'fail',c);}}

  at_helios_bar(a,core){
    if(!core.state.flags.metKael){core.state.flags.metKael=true;core.remember('Kael Voss wurde im Last Light von drei bewaffneten Söldnern bedrängt.',70,'npc');}
    if(core.state.flags.heliosConflictResolved&&(a.targets.includes('kael')||a.t.includes('echo')||a.targets.includes('datenchip')||a.targets.includes('artefakt')||a.intents.includes('talk'))){return this.kaelConversation(a,core);}

    if(a.intents.includes('observe')){const c=core.check('perception',11,['observation','streetwise']);if(c.success){return this.out(`${this.rollLine(c)}\n\nDu lässt deinen Blick nicht auf den Waffen hängen, sondern auf Händen, Türen und Abständen. Der Anführer trägt eine schwere Pistole, die beiden anderen nur Schockstöcke – vielleicht wollen sie Kael lebend. Keiner steht zwischen ihm und dem schmalen Wartungszugang hinter der Bar.\n\nKael selbst wirkt angespannt, aber nicht überrascht. Als sich eure Blicke für einen Sekundenbruchteil treffen, tippt er zweimal mit dem Finger auf den Tisch. Ein altes Unterweltzeichen: **Nicht direkt zu mir.**`,'success',c);}return this.out(`${this.rollLine(c)}\n\nDu versuchst, aus Haltung und Blicken schlau zu werden, doch das Neon, die Musik und die Enge machen es schwer. Sicher ist nur: Die drei Söldner sind wegen Kael hier – und sie erwarten Ärger.`,'neutral',c);}

    if(a.intents.includes('sneak')){const c=core.check('reflexes',12,['stealth','observation']);if(c.success){core.state.flags.heliosConflictResolved=true;core.state.flags.kaelSafe=true;core.relation('kael',8);core.remember('Du hast Kael im Last Light über den Wartungszugang erreicht, ohne die Söldner frontal zu konfrontieren.',70,'choice');return this.out(`${this.rollLine(c)}\n\nDu gehst nicht auf Kael zu. Stattdessen verschwindest du zwischen zwei Serviceautomaten, öffnest eine halb gelöste Wartungsblende und ziehst dich in den engen Schacht. Hinter dir dröhnt Musik durch das Metall, während du dich Zentimeter für Zentimeter an der Bar entlangbewegst.\n\nDu kommst hinter Kaels Sitzplatz wieder heraus. Er zuckt kaum sichtbar zusammen, dann schiebt er dir unter dem Tisch einen dünnen Datenchip zu. „Sehr gut“, murmelt er, ohne dich anzusehen. „Dann müssen wir jetzt nur noch so tun, als wäre das hier alles völlig normal.“`,'success',c);}return this.out(`${this.rollLine(c)}\n\nDer Plan ist gut, die Station weniger. Eine alte Halterung gibt nach und die Wartungsblende schlägt mit einem metallischen Knall auf den Boden. Drei Köpfe drehen sich gleichzeitig in deine Richtung.\n\nKael schließt kurz die Augen, als hätte er genau diesen Ausgang befürchtet. Der Anführer der Söldner lächelt. „Da ist ja unser zweites Problem.“`,'fail',c);}

    if(a.intents.includes('talk')){const threatening=a.tone==='threatening'||a.targets.includes('soeldner')&&a.intents.includes('attack');const stat='charisma';const tags=threatening?['intimidation']:a.tone==='deceptive'?['deception','calm_social']:['persuasion','negotiation','calm_social'];const diff=threatening?14:13;const c=core.check(stat,diff,tags);
      if(c.success){core.state.flags.heliosConflictResolved=true;core.state.flags.kaelSafe=true;core.relation('kael',threatening?3:6);core.reputation('crimson',threatening?2:0);const flavor=threatening?'Du lässt deine Hand sichtbar in Richtung Pistole sinken, ohne sie zu ziehen. Du sprichst leise genug, dass der Anführer sich vorbeugen muss – und genau das nimmt ihm für einen Moment die Kontrolle über den Raum.':'Du gibst ihnen etwas, das in solchen Situationen oft wertvoller ist als Geld: einen plausiblen Ausweg, bei dem niemand vor der ganzen Bar das Gesicht verliert.';return this.out(`${this.rollLine(c)}\n\n${flavor}\n\nDer Anführer mustert dich lange. Einer seiner Leute flüstert ihm etwas zu. Schließlich tritt er einen Schritt zurück. „Kael ist dein Problem“, sagt er. „Aber ab jetzt bist du unseres.“ Die drei ziehen ab, ohne den Rücken ganz zu drehen.\n\nKael wartet, bis die Tür geschlossen ist. Dann hebt er langsam sein Glas. „Das war entweder sehr klug oder sehr dumm. Bei dir bin ich mir noch nicht sicher.“`,'success',c);}
      core.damage(threatening?8:3);return this.out(`${this.rollLine(c)}\n\nDu setzt an, doch der Anführer fällt dir ins Wort. Er hat nicht nur deine Worte gehört – er hat die Unsicherheit dahinter erkannt. „Nein“, sagt er ruhig. „So läuft das nicht.“\n\nDie Situation kippt innerhalb eines Atemzugs. Ein Stoß, ein umgeworfener Tisch, ein Schmerz an den Rippen. Kael nutzt das Chaos, um hinter die Bar zu springen. **${threatening?8:3} Gesundheit verloren.** Du hast den Konflikt nicht beendet, aber noch ist nichts endgültig entschieden.`,'fail',c);}

    if(a.intents.includes('attack')){const c=core.check('combat',14,['combat','ranged']);if(c.success){core.state.flags.heliosConflictResolved=true;core.state.flags.kaelSafe=true;core.damage(c.degree==='critical'?0:4);core.reputation('union',-2);core.relation('kael',-2);return this.out(`${this.rollLine(c)}\n\nDu handelst, bevor der Anführer seine Waffe ganz frei bekommt. Der erste Schuss zerlegt die Lampe über seinem Kopf; Dunkelheit und Funken schlagen zwischen euch. Du nutzt den Moment, stößt einen Tisch um und zwingst die drei in Deckung.\n\nDer Kampf dauert kaum zehn Sekunden. Als die Stationssirene in der Ferne anspringt, ziehen sich die Söldner zurück. Kael kommt hinter der Bar hervor und starrt auf die rauchende Decke. „Ich hatte gehofft, wir könnten heute wenigstens **eine** Station verlassen, ohne auf einer Sicherheitsaufnahme zu landen.“`,'success',c);}core.damage(12);return this.out(`${this.rollLine(c)}\n\nDu ziehst zuerst – aber nicht schnell genug. Der Anführer reißt den Tisch herum, sein Partner trifft dich mit einem Schockstock an der Schulter und für einen Moment verschwindet die Welt in weißem Rauschen.\n\nDu kommst hinter einer Säule wieder zu dir, noch im Kampf, aber mit deutlich schlechterer Ausgangslage. **12 Gesundheit verloren.** Kael lebt, doch die Söldner kontrollieren jetzt die Mitte des Raumes.`,'fail',c);}
  }

  kaelConversation(a,core){
    core.state.flags.knowsEcho=true;core.state.flags.nereidUnlocked=true;core.relation('kael',2);core.remember('Kael gab dir Koordinaten zu einer aktiven Architektenanlage auf Nereid IV.',95,'story');core.setQuest('main_echo',{stage:2});core.setObjectives('main_echo',['Reise nach Nereid IV und finde heraus, warum die Ruine auf dein Artefakt reagiert.']);
    const callback=a.quoted?`Du formulierst es mit deinen eigenen Worten – „${esc(a.quoted)}“. Kael reagiert nicht sofort darauf; sein Blick bleibt am Artefakt hängen.`:'Du legst ihm deine Beobachtungen dar. Kael hört diesmal ohne seine üblichen Kommentare zu.';
    return this.out(`${callback}\n\n„ECHO ist kein Projektname“, sagt er schließlich. „Es ist das Wort, das in sechs voneinander getrennten Systemen aufgetaucht ist, kurz bevor tote Architektentechnik wieder aktiv wurde.“ Er schiebt dir den Datenchip zu. Darauf liegt nur ein Koordinatensatz: **Nereid IV**.\n\nKael senkt die Stimme. „Vor drei Tagen hat dort eine Ruine angefangen, ein Signal zu senden. Nicht an die Union. Nicht an Helix. An **dein Schiff**. Und das Unangenehme daran?“ Er sieht dir direkt in die Augen. „Die Wayfarer war zu diesem Zeitpunkt noch gar nicht in Reichweite.“`,'success');
  }

  at_ruins_gate(a,core){
    if(a.intents.includes('observe')){const c=core.check('intelligence',13,['analysis','ancient_tech','observation']);if(c.success)return this.out(`${this.rollLine(c)}\n\nDie Glyphen sind keine Schrift im klassischen Sinn. Sie verändern ihre Abstände abhängig davon, wo du stehst – als würden sie nicht Informationen zeigen, sondern **Möglichkeiten**. Ein Muster wiederholt sich immer dort, wo dein Artefakt näher an die Wand kommt.\n\nDu erkennst schließlich, dass das Tor keinen Schlüssel erwartet. Es wartet auf eine Entscheidung: Kontakt herstellen oder Abstand halten.`,'success',c);return this.out(`${this.rollLine(c)}\n\nDie Lichtadern reagieren auf deine Bewegungen, aber jedes Muster zerfällt, sobald du glaubst, es verstanden zu haben. Für einen Moment scheint dein eigener Schatten einen Herzschlag zu spät zu reagieren. Du bist nicht sicher, ob das an der dünnen Atmosphäre liegt.`,'neutral',c);
    }
    if((a.targets.includes('artefakt')||a.targets.includes('tor'))&&a.intents.includes('use')){const c=core.check('willpower',15,['mental','resist','ancient_tech']);if(c.success){core.state.flags.gateOpened=true;core.forceTravel('ruins_archive');core.setQuest('main_echo',{stage:3});core.setObjectives('main_echo',['Erkunde das Echo-Archiv und finde heraus, wer – oder was – dich erwartet.']);core.remember('Du hast das Architektentor mit dem Artefakt geöffnet und eine Erinnerung gehört, die du nie ausgesprochen hattest.',100,'echo');return this.out(`${this.rollLine(c)}\n\nDu hältst das Artefakt an die Wand. Das Material gibt nicht nach – stattdessen verschwindet jedes Geräusch. Kein Wind. Kein Atem. Nicht einmal das Rauschen deines Anzugs.\n\nDann hörst du eine Stimme. **Deine eigene.** Jünger, unsicherer. Sie sagt einen Satz, an den du dich nicht erinnerst: „Wir waren nicht die Ersten.“ Die schwarze Wand faltet sich lautlos auseinander und gibt einen Raum frei, der unmöglich in die Struktur passen kann.\n\nAls du die Schwelle überschreitest, erwachen über dir tausende Sterne. Einige davon existieren laut deinen Karten noch gar nicht.`,'success',c,{travel:true});}
      core.damage(7);return this.out(`${this.rollLine(c)}\n\nIn dem Moment, in dem das Artefakt die Wand berührt, schießen die Lichtadern deinen Arm hinauf. Erinnerungen brechen auf – Gerüche, Stimmen, Orte – aber in jeder Szene steht für den Bruchteil einer Sekunde jemand, den du nie gesehen hast.\n\nDu reißt dich los. **7 Gesundheit verloren.** Das Tor bleibt geschlossen. Doch tief dahinter antwortet etwas mit drei langsamen Impulsen. Nicht zufällig. Fast wie ein Herzschlag.`,'fail',c);}
  }

  at_ruins_archive(a,core){
    if(a.intents.includes('observe')||a.intents.includes('use')||a.t.includes('echo')||a.t.includes('stern')){const c=core.check('willpower',14,['mental','analysis','ancient_tech']);core.state.flags.archiveTouched=true;if(c.success){core.remember('Im Echo-Archiv sahst du eine Sternenkarte, auf der Helios-9 zerstört war, obwohl die Station noch existiert.',100,'prophecy');core.setQuest('main_echo',{stage:4,status:'completed'});core.setObjectives('main_echo',['Akt I abgeschlossen: Entscheide im nächsten Akt, wem du von der Zukunftskarte erzählst.']);return this.out(`${this.rollLine(c)}\n\nDu näherst dich der schwebenden Sternenkarte. Ein Lichtpunkt löst sich aus dem Geflecht und gleitet auf dich zu. Als er deine Stirn berührt, ist der Raum plötzlich fort.\n\nDu stehst auf der Brücke der Wayfarer – doch die Frontscheibe zeigt brennende Trümmer. Helios-9 ist auseinandergebrochen. Funksprüche überschlagen sich, Menschen schreien, und über allem liegt dieselbe ruhige Stimme: **„Dies ist nicht, was geschehen wird. Dies ist, was bereits erinnert wird.“**\n\nDann bist du wieder im Archiv. Auf der echten Sternenkarte leuchtet Helios-9 friedlich. Noch.\n\n**AKT I · DAS SIGNAL ABGESCHLOSSEN.** Deine Entscheidungen, Kaels Vertrauen, dein Ruf und deine Erinnerungen bleiben im World State gespeichert und beeinflussen die folgenden Akte.`,'success',c,{ending:true});}return this.out(`${this.rollLine(c)}\n\nDu versuchst, dich auf eine einzelne Projektion zu konzentrieren. Sofort vervielfacht sie sich. Dutzende Versionen der Wayfarer, von dir, von Helios-9 – manche intakt, manche zerstört.\n\nDu brichst den Kontakt ab, bevor du unterscheiden kannst, ob du mögliche Zukünfte siehst oder Erinnerungen an Dinge, die nie passiert sind. Das Archiv bleibt offen. Es wartet darauf, dass du es erneut versuchst.`,'fail',c);}
  }

  generic(a,core){
    const loc=core.location(); let stat='perception',tags=['observation'],diff=11;
    if(a.intents.includes('hack')||a.intents.includes('repair')){stat='tech';tags=['hacking','repair','engineering'];diff=12;}
    else if(a.intents.includes('talk')){stat='charisma';tags=a.tone==='deceptive'?['deception']:a.tone==='threatening'?['intimidation']:['persuasion','calm_social'];diff=12;}
    else if(a.intents.includes('attack')){stat='combat';tags=['combat'];diff=13;}
    else if(a.intents.includes('sneak')){stat='reflexes';tags=['stealth'];diff=12;}
    else if(a.intents.includes('use')){stat='intelligence';tags=['analysis','improvise'];diff=12;}
    const c=core.check(stat,diff,tags);
    const target=a.targets.length?`Dein Fokus liegt auf **${a.targets.join(', ')}**.`:'Du arbeitest mit dem, was die Umgebung gerade hergibt.';
    const method=a.intents.length?`Aus deiner Formulierung lese ich vor allem **${a.intents.slice(0,3).join(' + ')}** heraus.`:'Dein Plan passt in keine einfache Standardschublade; deshalb zählt vor allem Wahrnehmung und Improvisation.';
    const affordances=(loc.affordances||['die Umgebung genauer lesen','deinen Ansatz verändern','nach einem indirekten Weg suchen']);
    const afford=this.pick(affordances,core);
    const successConsequence=this.pick([
      `Der unmittelbare Vorteil ist klein, aber konkret: **${afford}** wird plötzlich zu einer brauchbaren Möglichkeit.`,
      `Etwas in der Situation verschiebt sich zu deinen Gunsten. Besonders **${afford}** fällt dir jetzt als nächster Hebel auf.`,
      `Du erzwingst keinen Wundererfolg, aber du gewinnst Initiative. Der sinnvollste Anschluss wäre jetzt: **${afford}**.`
    ],core);
    const failConsequence=this.pick([
      `Der Plan scheitert nicht an einer unsichtbaren Wand – er erzeugt Widerstand. **${afford}** könnte dir helfen, den gleichen Gedanken anders aufzuziehen.`,
      `Du kommst nicht dort an, wo du wolltest, aber die Reaktion verrät dir etwas über die Lage. **${afford}** wirkt jetzt wichtiger als vorher.`,
      `Die Welt blockiert dich nicht einfach; sie antwortet. Dein Vorgehen hat Aufmerksamkeit erzeugt, und **${afford}** könnte der bessere zweite Schritt sein.`
    ],core);
    const degreeFlavor={critical:'Alles greift für einen seltenen Moment ineinander. Dein Timing ist beinahe unverschämt gut.',strong:'Du bekommst nicht nur das gewünschte Ergebnis, sondern bemerkst dabei noch einen zusätzlichen Vorteil.',success:'Es funktioniert – nicht perfekt, aber gut genug, um die Lage wirklich zu verändern.',fail:'Für einen Moment sieht es aus, als könnte es funktionieren. Dann kippt ein Detail gegen dich.',bad:'Mehrere kleine Probleme treffen gleichzeitig zusammen und machen aus dem Versuch eine deutlich sichtbarere Sache als geplant.',fumble:'Der Moment bricht dir vollständig weg. Aus einem kleinen Risiko wird innerhalb von Sekunden ein neues Problem.'}[c.degree];
    return this.out(`${this.rollLine(c)}\n\n${method} ${target}\n\n${degreeFlavor} ${c.success?successConsequence:failConsequence}\n\nDabei bleibt deine ursprüngliche Absicht erhalten: Die Engine behandelt deine Worte nicht als bloßes Stichwort, sondern als Beschreibung dessen, was dein Charakter tatsächlich versucht.`,c.success?'success':'fail',c);
  }}
