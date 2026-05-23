/** Historical framing + debate expansion for scenario dialogues */
const narr = (ko, en) => ({ type: "narrator", ko, en });
const line = (id, nameKo, nameEn, faction, ko, en) => ({
  type: "line",
  id,
  nameKo,
  nameEn,
  faction,
  ko,
  en,
});

const EXTENDED_IDS = new Set([1, 2, 6, 7, 10, 18, 19]);

const HISTORICAL_FRAME = {
  3: narr(
    "1948년 4월 제주 4·3과 5·10 단독 선거는 같은 해의 두 얼굴이었다. 남쪽은 ‘유엔 감시 하의 민주주의’를, 북쪽은 ‘남조선 단독 정부 거부’를 외쳤고, 제주 산간에서는 총과 화염이 먼저 말을 대신했다.",
    "April 1948: Jeju 4.3 and the May 10 election were two faces of one year. The South called it UN-supervised democracy; the North rejected a southern-only government—on Jeju's hills, guns spoke first."
  ),
  4: narr(
    "1948년 10월, 여수·순천 반란은 국군 일부가 ‘진정한 혁명’을 외치며 총구를 돌린 사건이었다. 미군정과 이승만 정부는 이를 북한의 손을 빌린 반역으로 보았고, 반란군은 배고픈 민중과 실망한 병사의 이름을 들었다.",
    "October 1948: the Yeosu–Suncheon mutiny saw ROK soldiers turn rifles crying 'true revolution.' The MG and Rhee called it treason backed by the North; mutineers invoked hungry people and disappointed troops."
  ),
  5: narr(
    "1949년, 38선 인근 송악산 일대는 ‘작은 전쟁’의 연습장이었다. 양측 모두 산 한 봉우리가 다음 대전의 전초전이라 믿었고, 밤마다 정찰과 포격이 오갔다.",
    "1949 near Songak on the 38th: a rehearsal for the larger war. Both sides believed each hill was the prelude; nightly raids and shells traded places."
  ),
  8: narr(
    "1950년 7월 5일 오산·미원, 미 육군 24사단 선봉 ‘스미스 특遣대’는 T-34와의 첫 조우에서 참담한 손실을 냈다. ‘미군이 왔다’는 말만으로는 38선이 복구되지 않음을, 이 날 증명했다.",
    "July 5, 1950 at Osan: Task Force Smith's first meeting with T-34s proved Americans alone could not restore the 38th line."
  ),
  9: narr(
    "1950년 7월 대전, 윌리엄 딘 장군은 후방이 아니라 전선으로 갔다. 도시가 함락되기 전까지 그는 병사들과 탄약을 나누며 ‘시간’을 사려 했고, 결국 실종·포로가 되어 UN군 사령부를 충격에 빠뜨렸다.",
    "July 1950 Daejeon: General Dean went to the front, shared ammo, bought time—and was lost/captured, shocking UN command."
  ),
  11: narr(
    "1950년 8월 다부동·유학산, 백선엽 장군의 ‘후퇴하면 나를 쏴라’는 말은 낙동강 방어선 붕괴 직전의 절박함을 담았다. 국군 1사단이 물러서면 대구는 하루도 버티기 어렵다는 판단이었다.",
    "August 1950 Dabudong: Paik's 'shoot me if I retreat' captured desperation before the Naktong nearly broke—lose here, Daegu falls in a day."
  ),
  12: narr(
    "1950년 9월 통영 상륙은 낙동강 본공세와 동시에 진행된 측면 기동이었다. 국군 해병과 미 해군이 적 후방을 겨냥했고, ‘부산만 남긴다’는 말에 바다라는 출구가 더해졌다.",
    "September 1950 Tongyeong landing: a flank stroke while the Naktong burned—ROK Marines and US Navy struck the enemy rear."
  ),
  13: narr(
    "1950년 9월 15일 인천 상륙은 조수 간만에 성패가 갈렸다. 맥아더는 ‘미친 작전’이라 불리는 이 도박을 고집했고, 월미도 포병을 먼저 잠재워야 본 상륙이 가능했다.",
    "15 September 1950 Inchon: tides decided fate. MacArthur's 'mad' gamble required silencing Wolmi batteries first."
  ),
  14: narr(
    "1950년 9월 서울 재탈환 작전은 상징과 실전이 겹친 날이었다. 광화문·중앙청을 누가 먼저 차지하느냐가 국제 여론과 국내 정통성 싸움에 직결되었다.",
    "Recapturing Seoul September 1950: symbols and combat overlapped—Gwanghwamun and the Capitol were legitimacy made stone."
  ),
  15: narr(
    "1950년 10월, UN군은 38선을 넘어 북진했다. ‘추신추위(追甚追北)’—끝까지 쫓아가자는 구호 뒤에, 통일이라는 말이 정치·군사 목표를 동시에 흔들었다.",
    "October 1950: UN forces crossed the 38th northward—'pursue to the end' made unification both political slogan and military order."
  ),
  16: narr(
    "1950년 10월 평양 함락은 전쟁의 극적 정점이었다. 대동강을 건넌 연합군은 ‘이제 끝’이라 믿었지만, 강 건너편의 그림자는 이미 움직이고 있었다.",
    "October 1950 Pyongyang fell—the war's dramatic peak. Allies crossing the Taedong thought it ended; shadows beyond the river already moved."
  ),
  17: narr(
    "1950년 10–11월, UN군은 압록강·두만강을 ‘집으로 가는 크리스마스’에 가깝다고 믿었다. 그러나 11월 중순, 중국 인민지원군이 강을 건너기 전에 정찰은 ‘소규모 지연부대’만 보고했다. 오늘의 작전 목표는 강 남안의 열린 평지—붉은 깃발이 꽂힌 거점이다.",
    "Oct–Nov 1950: UN troops neared the Yalu for a 'home-by-Christmas' war—yet mid-November, intelligence missed masses crossing. Today's objective is open ground south of the river—the red flag hill."
  ),
  20: narr(
    "1950년 12월 흥남 철수는 ‘미라클’로 불렸다. 미 해군이 19만 명과 병참 물자를 건져냈지만, 현지 민간인과 남겨진 장비의 상처는 오래 남았다.",
    "December 1950 Hungnam evacuation—called a miracle: 190,000 lifted, yet civilians and abandoned gear scarred memory."
  ),
  21: narr(
    "1951년 1월, 중공·인민군 3차 공세로 서울이 다시 위험에 빠졌다. 리지웨이는 ‘전술적 후퇴’라 부르고, 병사들은 ‘또 물러나나’고 물었다.",
    "January 1951: the third offensive threatened Seoul again. Ridgway said 'tactical withdrawal'; soldiers asked 'how far back again?'"
  ),
  22: narr(
    "1951년 2월 지평리(Chipyongni)는 중공 4개 사단 포위 속에서 UN군이 버틴 전투다. 프랑스 기갑대·미 23연대·국군이 같은 참호를 공유했고, ‘무적’ 신화가 깨진 지점으로 기록된다.",
    "February 1951 Chipyongni: four Chinese divisions encircled UN forces—French Battalion, US 23rd RCT, ROK held one perimeter; the 'invincible' myth broke here."
  ),
  23: narr(
    "1951년 원주·춘천 일대, 공군 기지와 도로망이 전선의 숨통이었다. 겨울 포위와 게릴라에 기지가 끊기면, 동부 전선 전체가 숨이 막혔다.",
    "1951 Wonju–Chuncheon: airfields and roads were the front's lungs—winter encirclement could choke the entire east."
  ),
  24: narr(
    "1951년 3월, UN군의 ‘킬러·리퍼’ 작전으로 서울이 세 번째로 전쟁의 중심이 되었다. 이번에는 ‘탈환’이 아니라 ‘재확인’에 가까운 싸움이었다.",
    "March 1951: Operations Killer and Ripper made Seoul war's center a third time—less liberation, more re-assertion."
  ),
  25: narr(
    "1951년 4월 임진강 전투에서 영국군 글로스터셔 연대(약 1,000명)가 3일간 포위를 버텼다. UN 다국적군 방어선의 상징이 된 전투이며, 협상 테이블과 전선이 동시에 달아났다.",
    "April 1951 Imjin: Gloucestershire Regiment (~1,000 men) held encirclement three days—a symbol of the multinational line."
  ),
  26: narr(
    "1951년 8–9월, 판문점에서 휴전 회담이 시작된 뒤에도 고지전은 멈추지 않았다. ‘협상용 산’을 차지하려는 싸움이 피의 능선에서 격화했다.",
    "Aug–Sep 1951: peace talks at Panmunjom began, yet hill fights intensified—'negotiating hills' at Bloody Ridge."
  ),
  27: narr(
    "1951년 9월 하트브레이크 릿지(단장의 능선)는 이름 그대로의 전투였다. 종군기자 알런 무어는 ‘심장이 부서진다’고 썼고, 지하 벙커 진지는 공격을 삼켰다.",
    "September 1951 Heartbreak Ridge: reporters wrote of broken hearts; underground bunkers swallowed assaults."
  ),
  28: narr(
    "1952년 10월 백마고지, 철의 삼각지에서 10일간 수십 차례 고지 주인이 바뀌었다. 국군 9사단과 중공군 38군·47군이 같은 비탈을 밤낮으로 두고 쟁탈했다.",
    "October 1952 White Horse: in ten days the hill changed hands dozens of times—ROK 9th Division vs Chinese 38th/47th Armies."
  ),
  29: narr(
    "1953년 3월, 휴전 임박기 저격능선은 ‘조용한 전선’의 상징이었다. 한 발의 총알이 협상 테이블의 1cm를 바꿀 수 있다고 병사들은 말했다.",
    "March 1953 Sniper Ridge: the 'quiet front'—soldiers said one bullet could shift a centimeter at the table."
  ),
  30: narr(
    "1953년 7월 27일 휴전 협정 서명 전날, 금성 돌출부에서 마지막 대규모 공세가 벌어졌다. 이승만은 휴전을 거부했지만, 전선은 ‘마지막 1cm’를 두고 피를 쏟았다.",
    "Eve of 27 July 1953 armistice: last offensive at Kumhwa—Rhee opposed truce, but the line bled for final centimeters."
  ),
};

const EXTRA_BEATS = {
  17: [
    line(
      "lim",
      "임부택",
      "Lim Bu-taek",
      "rok",
      "물병에 담아 오라고요? 병사들은 고향이 평양인 사람도, 서울인 사람도 있습니다. 통일이란 말이 모든 이의 눈물을 닦아주지는 않습니다.",
      "You want water in bottles? Soldiers hail from Pyongyang and Seoul alike—the word unification does not dry every tear."
    ),
    line(
      "us",
      "UN군 참모",
      "UN Staff",
      "us",
      "그래서 작전 목표는 강 남안의 열린 고지입니다. 붉은 깃발이 꽂힌 지점—거기까지 부대를 모으십시오. 강 위는 정찰만, 건너지 마십시오.",
      "So the objective is open ground south of the river—the red flag hill. Rally units there. Recon the river; do not cross."
    ),
  ],
};

export function enrichScenarioScript(scenarioId, script) {
  if (!script?.length || EXTENDED_IDS.has(scenarioId)) return script;

  const out = [];
  const frame = HISTORICAL_FRAME[scenarioId];
  if (frame) out.push(frame);

  const start = frame && script[0]?.type === "narrator" ? 1 : 0;
  for (let i = start; i < script.length; i++) out.push(script[i]);

  const extras = EXTRA_BEATS[scenarioId];
  if (extras?.length) {
    const closing = out.length && out[out.length - 1].type === "narrator" ? out.pop() : null;
    out.push(...extras);
    if (closing) out.push(closing);
  }

  return out;
}
