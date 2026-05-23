import { registerScenarioText } from "../i18n.js";
import { getBalancedTurnLimit, getBalancedHoldTurns } from "./missionBalance.js";

const SCENARIOS = [
  { id: 1, chapter: 1, map: "seoul_city", mission: "hold", holdTurns: 4, turnLimit: 14, scene: "liberation" },
  { id: 2, chapter: 1, map: "daegu_riot", mission: "capture", turnLimit: 16, scene: "riot" },
  { id: 3, chapter: 1, map: "jeju_hill", mission: "hold", holdTurns: 5, turnLimit: 16, scene: "government" },
  { id: 4, chapter: 1, map: "yeosu_street", mission: "defeat", turnLimit: 18, scene: "yeosu" },
  { id: 5, chapter: 1, map: "songak_hill", mission: "capture", turnLimit: 16, scene: "songak" },
  { id: 6, chapter: 2, map: "invasion_625", mission: "escape", turnLimit: 20, scene: "storm" },
  { id: 7, chapter: 2, map: "han_river", mission: "escape", turnLimit: 18, scene: "hanriver" },
  { id: 8, chapter: 2, map: "osan_hill", mission: "hold", holdTurns: 5, turnLimit: 16, scene: "osan" },
  { id: 9, chapter: 2, map: "daejeon_city", mission: "hold", holdTurns: 6, turnLimit: 22, scene: "daejeon" },
  { id: 10, chapter: 2, map: "naktong_line", mission: "hold", holdTurns: 8, turnLimit: 24, scene: "naktong" },
  { id: 11, chapter: 2, map: "dabudong", mission: "capture", turnLimit: 20, scene: "dabudong" },
  { id: 12, chapter: 2, map: "tongyeong_beach", mission: "capture", turnLimit: 18, scene: "tongyeong" },
  { id: 13, chapter: 3, map: "inchon_landing", mission: "capture", turnLimit: 16, scene: "inchon" },
  { id: 14, chapter: 3, map: "seoul_recapture", mission: "capture", turnLimit: 16, scene: "seoul_flag" },
  { id: 15, chapter: 3, map: "cross_38", mission: "capture", turnLimit: 14, scene: "cross38" },
  { id: 16, chapter: 3, map: "pyongyang", mission: "capture", turnLimit: 16, scene: "pyongyang" },
  { id: 17, chapter: 3, map: "yalu_river", mission: "capture", turnLimit: 14, scene: "yalu" },
  { id: 18, chapter: 4, map: "chinese_night", mission: "escape", turnLimit: 18, scene: "chinese" },
  { id: 19, chapter: 4, map: "chosin", mission: "escape", turnLimit: 22, scene: "chosin" },
  { id: 20, chapter: 4, map: "hungnam", mission: "escort", holdTurns: 6, turnLimit: 20, scene: "hungnam" },
  { id: 21, chapter: 4, map: "seoul_relost", mission: "escape", turnLimit: 18, scene: "retreat14" },
  { id: 22, chapter: 5, map: "chipyong", mission: "hold", holdTurns: 6, turnLimit: 20, scene: "chipyong" },
  { id: 23, chapter: 5, map: "wonju", mission: "hold", holdTurns: 5, turnLimit: 18, scene: "wonju" },
  { id: 24, chapter: 5, map: "seoul_again", mission: "capture", turnLimit: 16, scene: "seoul_again" },
  { id: 25, chapter: 5, map: "imjin_gapyeong", mission: "hold", holdTurns: 7, turnLimit: 22, scene: "imjin" },
  { id: 26, chapter: 6, map: "bloody_ridge", mission: "capture", turnLimit: 20, scene: "bloody" },
  { id: 27, chapter: 6, map: "heartbreak_ridge", mission: "capture", turnLimit: 22, scene: "heartbreak" },
  { id: 28, chapter: 6, map: "white_horse", mission: "hold", holdTurns: 8, turnLimit: 24, scene: "whitehorse" },
  { id: 29, chapter: 6, map: "sniper_ridge", mission: "capture", turnLimit: 20, scene: "sniper" },
  { id: 30, chapter: 6, map: "punchbowl_final", mission: "hold", holdTurns: 10, turnLimit: 26, scene: "armistice" },
];

function initTexts() {
  const texts = [
    [1, { ko: { title: "혼돈의 해방과 38선", story: "일본 패망 후 미군과 소군이 진주하며 북위 38도선이 그어집니다. 초기 행정권을 쥐고 치안을 유지하세요.", location: "서울", chars: "존 하지 중장, 여운형" }, en: { title: "Liberation Chaos & the 38th", story: "After Japan's surrender, US and Soviet forces arrive and the 38th parallel divides Korea. Maintain order.", location: "Seoul", chars: "Lt. Gen. John Hodge, Yuh Woon-hyung" } }],
    [2, { ko: { title: "찬반탁과 거대한 갈등", story: "모스크바 3상회의 신탁통치를 둘러싼 찬탁·반탁 폭동. 치안 공백을 막는 진압 미션.", location: "대구·대전", chars: "조병옥, 박헌영" }, en: { title: "Trusteeship Riots", story: "Riots over Moscow's trusteeship decision. Suppress unrest in the cities.", location: "Daegu & Daejeon", chars: "Cho Byung-ok, Pak Hon-yong" } }],
    [3, { ko: { title: "남북 독자 정부 수립", story: "5.10 단독 선거와 제주 4.3. 양측 정통성 싸움이 본격화됩니다.", location: "서울·제주", chars: "이승만, 김일성" }, en: { title: "Separate Governments", story: "May 10 election and Jeju 4.3. Legitimacy struggle intensifies.", location: "Seoul & Jeju", chars: "Syngman Rhee, Kim Il Sung" } }],
    [4, { ko: { title: "여수·순천의 불꽃", story: "남로당 계열 군인의 반란. 여수·순천 점령지를 탈환하세요.", location: "여수·순천", chars: "송요찬, 지창수" }, en: { title: "Yeosu-Suncheon Mutiny", story: "Soldiers rise in mutiny. Retake Yeosu and Suncheon.", location: "Yeosu & Suncheon", chars: "Song Yo-chan, Ji Chang-su" } }],
    [5, { ko: { title: "38선 전초전: 송악산", story: "전쟁 전 38선 국지전. 송악산 고지 탈환.", location: "개성 송악산", chars: "서부덕 이등상사" }, en: { title: "Prelude at Songak", story: "Border clash before the war. Retake Songak heights.", location: "Kaesong Songak", chars: "Sgt. Seo Bu-deok" } }],
    [6, { ko: { title: "폭풍 작전: 6.25 발발", story: "T-34를 앞세운 북한군 전면 침공. 지연전 후 남쪽으로 철수하세요.", location: "웅진·포천·의정부", chars: "채병덕, 강건" }, en: { title: "Operation Pokpoong", story: "North Korean invasion with T-34s. Delay and withdraw south.", location: "Uijin, Pocheon, Uijeongbu", chars: "Chae Byong-deok, Kang Kon" } }],
    [7, { ko: { title: "한강교 폭파와 서울 함락", story: "한강 인도교 폭파 후 강북 병력 구출 및 남단 방어선.", location: "한강·마포", chars: "김홍일" }, en: { title: "Han River Bridge", story: "Bridge destroyed; evacuate trapped troops and hold the south bank.", location: "Han River", chars: "Kim Hong-il" } }],
    [8, { ko: { title: "죽미령: 스미스 특수임무대", story: "미군 선발대의 첫 교전. 압도적 화력 속 버티기.", location: "오산 죽미령", chars: "찰스 스미스" }, en: { title: "Task Force Smith", story: "First US ground engagement at Jukmi Pass. Hold against tanks.", location: "Osan", chars: "Charles Smith" } }],
    [9, { ko: { title: "지옥의 대전 가도", story: "대전을 사수해 미군 본대 전개 시간을 벌어라.", location: "대전 시가지", chars: "윌리엄 딘" }, en: { title: "Hell at Daejeon", story: "Defend Daejeon to buy time for US forces.", location: "Daejeon", chars: "William Dean" } }],
    [10, { ko: { title: "워커 라인: 낙동강", story: "더 이상 후퇴 없다. 낙동강 방어선을 지켜라.", location: "낙동강", chars: "월튼 워커" }, en: { title: "Walker Line: Naktong", story: "Stand or die. Hold the Naktong defense line.", location: "Naktong River", chars: "Walton Walker" } }],
    [11, { ko: { title: "구국의 격전: 다부동", story: "대구 방어의 핵심 다부동 고지를 사수하라.", location: "다부동", chars: "백선엽" }, en: { title: "Battle of Dabudong", story: "Defend the heights blocking the road to Daegu.", location: "Dabudong", chars: "Paik Sun-yup" } }],
    [12, { ko: { title: "통영 상륙 작전", story: "해병대 통영 상륙으로 적 측면 타격.", location: "통영 장평리", chars: "김성은" }, en: { title: "Tongyeong Landing", story: "Marine amphibious strike at Tongyeong.", location: "Tongyeong", chars: "Kim Seong-eun" } }],
    [13, { ko: { title: "인천 상륙 작전", story: "조수간만을 극복한 인천 상륙. 해안을 확보하라.", location: "인천 월미도", chars: "맥아더, 손원일" }, en: { title: "Inchon Landing", story: "Land at Inchon and cut enemy supply lines.", location: "Inchon", chars: "MacArthur, Son Won-il" } }],
    [14, { ko: { title: "국기 게양: 서울 수복", story: "3개월 만의 서울 수복. 중앙청 일대를 탈환하라.", location: "광화문·중앙청", chars: "신현준" }, en: { title: "Seoul Recaptured", story: "Retake central Seoul and raise the flag.", location: "Gwanghwamun", chars: "Shin Hyun-jun" } }],
    [15, { ko: { title: "38선을 넘어서", story: "국군이 먼저 38선을 돌파해 북진을 시작한다.", location: "양양 38선", chars: "이형근" }, en: { title: "Cross the 38th", story: "ROK forces cross the parallel and drive north.", location: "38th parallel", chars: "Lee Hyung-geun" } }],
    [16, { ko: { title: "평양 선봉 입성", story: "평양 시내 대동강 건너 주도권 확보.", location: "평양", chars: "유재흥" }, en: { title: "Enter Pyongyang", story: "Race to seize Pyongyang across the Taedong.", location: "Pyongyang", chars: "Yu Jae-heung" } }],
    [17, { ko: { title: "압록강의 물", story: "최북단 초산까지 진격. 압록강 강변 점령.", location: "초산", chars: "임부택" }, en: { title: "Waters of the Yalu", story: "Reach Chosan on the Yalu River.", location: "Chosan", chars: "Lim Bu-taek" } }],
    [18, { ko: { title: "밤의 지배자: 중공군 1차 공세", story: "중공군 야간 기습. 포위망을 뚫고 탈출하라.", location: "온정·운산", chars: "팽덕회" }, en: { title: "Night Assault: Chinese Offensive", story: "PLA night attacks. Break out of encirclement.", location: "Onjong", chars: "Peng Dehuai" } }],
    [19, { ko: { title: "장진호 전투", story: "영하 40도 혹한 속 포위 탈출.", location: "장진호", chars: "올리버 스미스" }, en: { title: "Battle of Chosin", story: "Break out from encirclement in brutal cold.", location: "Chosin Reservoir", chars: "Oliver Smith" } }],
    [20, { ko: { title: "흥남 부두의 기적", story: "피난민 수송과 철수. 흥남 부두를 지켜라.", location: "흥남항", chars: "알몬드, 현봉학" }, en: { title: "Miracle at Hungnam", story: "Evacuate refugees and hold the dock.", location: "Hungnam", chars: "Almond, Hyun Bong-hak" } }],
    [21, { ko: { title: "1.4 후퇴와 서울 재함락", story: "중공군 공세에 서울을 내주고 후퇴. 생존이 목표.", location: "서울·한강", chars: "매슈 리지웨이" }, en: { title: "1.4 Retreat", story: "Chinese offensive forces another retreat from Seoul.", location: "Seoul", chars: "Matthew Ridgway" } }],
    [22, { ko: { title: "지평리 전투", story: "중공 4개 사단 공세를 막아낸 반격의 분수령.", location: "지평리", chars: "폴 프리먼, 랄프 몽클라르" }, en: { title: "Battle of Chipyong-ni", story: "Hold Chipyong-ni against massive Chinese assault.", location: "Chipyong-ni", chars: "Paul Freeman, Ralph Monclar" } }],
    [23, { ko: { title: "원주 방어선", story: "원주 비행장 일대 사수 작전.", location: "원주", chars: "네드 알몬드" }, en: { title: "Wonju Defense", story: "Defend Wonju airfield sector.", location: "Wonju", chars: "Edward Almond" } }],
    [24, { ko: { title: "영광의 귀환: 서울 재수복", story: "킬러·리퍼 작전으로 서울을 다시 탈환.", location: "서울·도봉산", chars: "연합군 지휘관" }, en: { title: "Seoul Liberated Again", story: "Recapture Seoul with overwhelming firepower.", location: "Seoul", chars: "UN commanders" } }],
    [25, { ko: { title: "임진강·가평", story: "영연방군의 혈전으로 서울 진입 차단.", location: "임진강·가평", chars: "제임스 칸" }, en: { title: "Imjin & Gapyeong", story: "Commonwealth forces block the spring offensive.", location: "Imjin & Gapyeong", chars: "James Carne" } }],
    [26, { ko: { title: "피의 능선", story: "휴전 회담과 함께 벌어진 능선 쟁탈전.", location: "양구 983고지", chars: "최영희" }, en: { title: "Bloody Ridge", story: "Seize and hold Bloody Ridge.", location: "Yanggu", chars: "Choi Young-hee" } }],
    [27, { ko: { title: "단장의 능선", story: "지하 요새를 파괴하는 반복 돌격.", location: "894고지", chars: "토마스 드레서" }, en: { title: "Heartbreak Ridge", story: "Assault entrenched heights repeatedly.", location: "Heartbreak Ridge", chars: "Thomas Dresher" } }],
    [28, { ko: { title: "백마고지", story: "10일간 24번 주인이 바뀐 고지전.", location: "철원 백마고지", chars: "김종오" }, en: { title: "White Horse Hill", story: "Hold White Horse Hill against repeated attacks.", location: "Cheorwon", chars: "Kim Jong-o" } }],
    [29, { ko: { title: "저격능선", story: "저격수 진지를 정면 돌파.", location: "김화 저격능선", chars: "정일권" }, en: { title: "Sniper Ridge", story: "Breach fortified Sniper Ridge.", location: "Kimhwa", chars: "Jung Il-kwon" } }],
    [30, { ko: { title: "금성 대공세와 휴전", story: "휴전 직전 마지막 대공세를 막아라. 1953년 7월 27일.", location: "화천·금성", chars: "마크 클라크, 강문봉" }, en: { title: "Punchbowl & Armistice", story: "Hold the line in the final offensive before armistice.", location: "Punchbowl", chars: "Mark Clark, Kang Moon-bong" } }],
  ];
  for (const [id, data] of texts) {
    registerScenarioText(id, data.ko, data.en);
  }
}

initTexts();

export function getScenario(id) {
  const s = SCENARIOS.find((sc) => sc.id === id);
  if (!s) return null;
  return {
    ...s,
    turnLimit: getBalancedTurnLimit(s),
    holdTurns: s.holdTurns ? getBalancedHoldTurns(s) : s.holdTurns,
  };
}

export function getAllScenarios() {
  return SCENARIOS;
}

export function getScenariosByChapter(ch) {
  return SCENARIOS.filter((s) => s.chapter === ch);
}

export const SCENE_GRADIENTS = {
  liberation: "linear-gradient(135deg,#2a3a4a,#4a5a6a,#8a7a5a)",
  riot: "linear-gradient(135deg,#4a3a2a,#6a5040,#3a2a20)",
  government: "linear-gradient(135deg,#3a4a3a,#5a6a5a,#2a3a4a)",
  yeosu: "linear-gradient(135deg,#5a4030,#8a6040,#2a2020)",
  songak: "linear-gradient(135deg,#5a5a4a,#7a7a6a,#3a4a3a)",
  storm: "linear-gradient(135deg,#1a2030,#3a4a6a,#6a3030)",
  hanriver: "linear-gradient(135deg,#2a3a5a,#4a6a8a,#1a2030)",
  osan: "linear-gradient(135deg,#4a5a3a,#6a7a5a,#3a3030)",
  daejeon: "linear-gradient(135deg,#5a5048,#7a7068,#4a3030)",
  naktong: "linear-gradient(135deg,#3a5a6a,#5a8a9a,#4a4030)",
  dabudong: "linear-gradient(135deg,#6a5a4a,#8a7a6a,#3a3530)",
  tongyeong: "linear-gradient(135deg,#5a7a8a,#8ab0c0,#4a5a4a)",
  inchon: "linear-gradient(135deg,#3a4a6a,#6a8aaa,#5a6a5a)",
  seoul_flag: "linear-gradient(135deg,#4a4a5a,#6a6a7a,#8a6a3a)",
  cross38: "linear-gradient(135deg,#4a5a4a,#6a7a6a,#3a4a5a)",
  pyongyang: "linear-gradient(135deg,#5a5a6a,#7a7a8a,#4a4a5a)",
  yalu: "linear-gradient(135deg,#6a8aaa,#9ab0c8,#4a5a6a)",
  chinese: "linear-gradient(135deg,#2a3040,#4a5060,#1a1a2a)",
  chosin: "linear-gradient(135deg,#c8d8e8,#a0b0c0,#4a5a6a)",
  hungnam: "linear-gradient(135deg,#4a5a7a,#6a7a9a,#3a4a5a)",
  retreat14: "linear-gradient(135deg,#4a5058,#6a7078,#3a4048)",
  chipyong: "linear-gradient(135deg,#5a5a48,#7a7a68,#4a4030)",
  wonju: "linear-gradient(135deg,#5a6a5a,#7a8a7a,#4a504a)",
  seoul_again: "linear-gradient(135deg,#5a5a60,#7a7a80,#6a5a40)",
  imjin: "linear-gradient(135deg,#4a6a5a,#6a8a7a,#3a4a4a)",
  bloody: "linear-gradient(135deg,#6a4040,#8a5050,#3a3030)",
  heartbreak: "linear-gradient(135deg,#5a4848,#7a5858,#4a3838)",
  whitehorse: "linear-gradient(135deg,#b0b8c0,#8a9098,#5a6068)",
  sniper: "linear-gradient(135deg,#5a5a50,#7a7a70,#4a4540)",
  armistice: "linear-gradient(135deg,#4a5a4a,#6a7a6a,#8a7a4a)",
};
