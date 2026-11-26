const letters=(count)=>'ABCDEFGH'.slice(0,count).split('');
const choices=(from,to,keys,count=3,noOfficialKey=false)=>Array.from({length:to-from+1},(_,i)=>({id:`q${from+i}`,number:from+i,type:'choice',options:letters(count),answers:keys?[keys[i]]:[],noOfficialKey}));
const gaps=(from,to,answers,noOfficialKey=false)=>Array.from({length:to-from+1},(_,i)=>({id:`q${from+i}`,number:from+i,type:'gap',answers:answers?.[i]||[],noOfficialKey}));
const writing=(number,minimumWords=0,noOfficialKey=false)=>({id:`q${number}`,number,type:'writing',minimumWords,answers:[],noOfficialKey});
const pages=(prefix,...numbers)=>numbers.map(n=>`assets/pages/${prefix}-${n}.png`);
const phrases=(...groups)=>groups.reduce((rows,group)=>rows.flatMap(row=>group.map(value=>`${row}${value}`)),['']).map(value=>value.trim());

const keyRw=['B','C','B','A','B','C','C','B','A','B','C','C','A','B','A','C','B','A','B','B','A','B','C','C'];
const schoolsRw=['B','C','A','A','B','B','B','C','B','A','C','A','C','B','C','A','C','B','C','B','A','C','B','B'];
const keyListening=['A','C','C','A','A','B','A','C','B','B','A','B','C','B','A','F','C','A','D','H'];
const schoolsListening=['C','A','C','A','A','B','A','C','B','A','B','C','B','A','B','E','F','G','A','B'];
const schoolsListeningGaps=[
  phrases(['','mrs '],['fairford']),
  phrases(['','on '],['friday','fri']),
  phrases(['','at ','for '],['7.30','7.30 a.m.','seven thirty','half seven','half past seven']),
  phrases(['','by '],['','a ','an ','the '],['train','trains'],['',' for a change']),
  phrases(['','a ','an ','the '],['','walking '],['boots'])
];

const test1={
  id:'a2-key-2020',title:'A2 Key 2020 Sample',subtitle:'Cambridge A2 Key sample papers',papers:[
    {id:'rw',title:'Reading and Writing',durationSeconds:3600,parts:[
      {id:'rw-p1',title:'Part 1 · Notices and messages',instructions:'Read the source pages, then choose A, B, or C.',sourcePages:pages('key-rw',2,3),questions:choices(1,6,keyRw.slice(0,6))},
      {id:'rw-p2',title:'Part 2 · Matching people and texts',instructions:'Match each statement to person A, B, or C.',sourcePages:pages('key-rw',4,5),questions:choices(7,13,keyRw.slice(6,13))},
      {id:'rw-p3',title:'Part 3 · Longer text',instructions:'Read the text and choose A, B, or C.',sourcePages:pages('key-rw',6,7),questions:choices(14,18,keyRw.slice(13,18))},
      {id:'rw-p4',title:'Part 4 · Choice cloze',instructions:'Choose the best option for each gap.',sourcePages:pages('key-rw',8),questions:choices(19,24,keyRw.slice(18,24))},
      {id:'rw-p5',title:'Part 5 · Open cloze',instructions:'Write one word in each gap.',sourcePages:pages('key-rw',9),questions:gaps(25,30,[['a','this'],['in','during'],['of'],['go'],['play','watch'],['when','after']])},
      {id:'rw-p6',title:'Part 6 · Email',instructions:'Write 25 words or more. Writing is saved but not scored.',sourcePages:pages('key-rw',10),questions:[writing(31,25)]},
      {id:'rw-p7',title:'Part 7 · Picture story',instructions:'Write 35 words or more. Writing is saved but not scored.',sourcePages:pages('key-rw',11),questions:[writing(32,35)]}
    ]},
    {id:'listening',title:'Listening',audio:'materials/a2-key-2020-listening.mp3',parts:[
      {id:'l-p1',title:'Part 1 · Picture choices',instructions:'Listen and choose A, B, or C.',sourcePages:pages('key-l',2,3),questions:choices(1,5,keyListening.slice(0,5))},
      {id:'l-p2',title:'Part 2 · Gap fill',instructions:'Write one word, number, date, or time.',sourcePages:pages('key-l',4),questions:gaps(6,10,[['august'],['19'],['drive'],['65'],['photograph']])},
      {id:'l-p3',title:'Part 3 · Conversation',instructions:'Choose A, B, or C.',sourcePages:pages('key-l',5),questions:choices(11,15,keyListening.slice(5,10))},
      {id:'l-p4',title:'Part 4 · Short recordings',instructions:'Choose A, B, or C.',sourcePages:pages('key-l',6),questions:choices(16,20,keyListening.slice(10,15))},
      {id:'l-p5',title:'Part 5 · Matching',instructions:'Match each person to A–H.',sourcePages:pages('key-l',7),questions:choices(21,25,keyListening.slice(15,20),8)}
    ]}
  ]
};

const test2={
  id:'a2-key-schools-2020',title:'A2 Key for Schools 2020 Sample',subtitle:'Cambridge A2 Key for Schools sample papers',papers:[
    {id:'rw',title:'Reading and Writing',durationSeconds:3600,parts:[
      {id:'rw-p1',title:'Part 1 · Notices and messages',instructions:'Read the source pages, then choose A, B, or C.',sourcePages:pages('schools-rw',2,3),questions:choices(1,6,schoolsRw.slice(0,6))},
      {id:'rw-p2',title:'Part 2 · Matching people and texts',instructions:'Match each statement to person A, B, or C.',sourcePages:pages('schools-rw',4,5),questions:choices(7,13,schoolsRw.slice(6,13))},
      {id:'rw-p3',title:'Part 3 · Longer text',instructions:'Read the text and choose A, B, or C.',sourcePages:pages('schools-rw',6,7),questions:choices(14,18,schoolsRw.slice(13,18))},
      {id:'rw-p4',title:'Part 4 · Choice cloze',instructions:'Choose the best option for each gap.',sourcePages:pages('schools-rw',8),questions:choices(19,24,schoolsRw.slice(18,24))},
      {id:'rw-p5',title:'Part 5 · Open cloze',instructions:'Write one word in each gap.',sourcePages:pages('schools-rw',9),questions:gaps(25,30,[['your','the'],['is'],['lot'],['on'],['they'],['to']])},
      {id:'rw-p6',title:'Part 6 · Email to Pat',instructions:'Write 25 words or more. The bank label “Tyler” is ignored because the paper says Pat.',sourcePages:pages('schools-rw',10),questions:[writing(31,25)]},
      {id:'rw-p7',title:'Part 7 · Picture story',instructions:'Write 35 words or more. Writing is saved but not scored.',sourcePages:pages('schools-rw',11),questions:[writing(32,35)]}
    ]},
    {id:'listening',title:'Listening',audio:'materials/a2-key-for-schools-2020-listening.mp3',keyNote:'Part 2 accepted forms were transcribed from a scanned bank report and should receive a final human check.',parts:[
      {id:'l-p1',title:'Part 1 · Picture choices',instructions:'Listen and choose A, B, or C.',sourcePages:pages('schools-l',2,3),questions:choices(1,5,schoolsListening.slice(0,5))},
      {id:'l-p2',title:'Part 2 · Gap fill',instructions:'Write one word, number, date, or time.',sourcePages:pages('schools-l',4),questions:gaps(6,10,schoolsListeningGaps)},
      {id:'l-p3',title:'Part 3 · Film conversation',instructions:'Choose A, B, or C.',sourcePages:pages('schools-l',5),questions:choices(11,15,schoolsListening.slice(5,10))},
      {id:'l-p4',title:'Part 4 · Short recordings',instructions:'Choose A, B, or C.',sourcePages:pages('schools-l',6),questions:choices(16,20,schoolsListening.slice(10,15))},
      {id:'l-p5',title:'Part 5 · Matching',instructions:'Match each person to A–H.',sourcePages:pages('schools-l',7),questions:choices(21,25,schoolsListening.slice(15,20),8)}
    ]}
  ]
};

const vn={id:'vietnamese-a2',title:'Vietnamese A2 Paper',subtitle:'Different local format · no official key supplied',noOfficialKey:true,papers:[
  {id:'rw',title:'Reading and Writing',noOfficialKey:true,parts:[
    {id:'vn-r1',title:'Reading Part 1 · Choice cloze',instructions:'Choose an answer, then self-check. No official key is available.',sourcePages:[],sourceText:`People love dolphins because they are beautiful to watch and friendly. Dolphins are also (1) ... of the cleverest animals and are just as clever as dogs. (2) ... is possible to teach them in the same way we teach monkeys and dogs. Some people (3) ... believe that dolphins have a special way of (4) ... to each other. (5) ... many other sea animals and fish, dolphins are in danger. Many dolphins are caught (6) ... mistake in fishing nets, but a (7) ... greater problem is that thousands of dolphins (8) ... dying because the sea is no longer clean enough.

1 A another · B one · C all
2 A There · B It · C This
3 A quite · B yet · C even
4 A talking · B talk · C talked
5 A As · B For · C Like
6 A with · B by · C from
7 A more · B much · C most
8 A were · B is · C are`,questions:choices(1,8,null,3,true)},
    {id:'vn-r2',title:'Reading Part 2 · Matching notices',instructions:'Match each statement to A–K. No official key is available.',sourcePages:[],sourceText:`9 If you want to do something special for your child's birthday, call this number.
10 This company can take you to catch your plane at any time.
11 If you need to buy something to wear, this may be the cheapest place to look.
12 This restaurant always has special meals for children.
13 If you need to know about the traffic, you can call this number.
14 You cannot travel by railway until tomorrow.
15 Only adults pay to go in here.
16 You must pay before you travel on this.

A For times of afternoon coach trips, please ask hotel receptionist.
B Telephone: 2222 for motorway news and 2223 for airport information.
C Ask your waiter for our under-12s' menu.
D Many children's toys and books half price this weekend only!
E Harrisons Department Store: new seasons' jackets, lowest prices in town.
F For cheap day return tickets, you must travel after 10am.
G Jenni's Airport Taxis: 433587, 24 hours / 7 days a week.
H Star Restaurant: Children's Party Room, open at weekends.
I Museum of Travel and Transport: entrance free for children.
J Do not get on the train without a ticket.
K No trains today because of very high winds.`,questions:choices(9,16,null,8,true).map(q=>({...q,options:'ABCDEFGHIJK'.split('')}))},
    {id:'vn-r3',title:'Reading Part 3 · Information transfer',instructions:'Type your answers. No official key is available.',sourcePages:[],sourceText:`Cresswell's Department Store — London, Manchester, Edinburgh
Sale: 5–10 January. Computers £550 — were £850.

Email from Robert to David: “I know you wanted to buy a computer so let's go to Cresswell's on the first day of the sale. Computers are £300 cheaper at the moment. There's a train to London at 7.10 a.m. Wait for me at the bus stop at 6.30 a.m. and we'll walk to the station together.”

Complete David's notes:
17 Name of shop
18 In which city
19 Date of trip
20 Where to meet Robert
21 What time
22 Train leaves at
23 Cost of computer`,questions:gaps(17,23,null,true)},
    {id:'vn-r4',title:'Reading Part 4 · Right, Wrong, Doesn’t say',instructions:'Choose A (Right), B (Wrong), or C (Doesn’t say). No official key is available.',sourcePages:[],sourceText:`Sean Murphy reads the late news on British television at 11 o'clock each evening.

“This is a good time for a news programme because we can report the early news from America and the late news from Europe. I still arrive home before midnight because the journey from the Television Centre to my home in north London only takes six minutes. My family are all asleep when I get in, but I usually make a drink of hot milk and read a book for about an hour.

I always get up to have breakfast with my three children before they catch the school bus. Then I take the newspapers and go back to bed for a short time. Later on, I go for a swim — newsreaders spend too much time sitting down! I sometimes go running. I've done the London Marathon twice. That's a race of over 40 kilometres. I finished each time, but I wasn't among the first!

I start work after lunch at two o'clock, when I go to my office. The rest of the day is spent planning the programme, but I always try to go home for an hour to see my children before they go to bed.”

24 Sean Murphy lives in London.
25 Sean's wife gives him a hot drink when he arrives home after work.
26 Sean takes his children to school in the morning.
27 Sean likes to go swimming with his colleagues from work.
28 Sean has won the London Marathon.
29 Sean's working day begins in the afternoon.
30 Sean usually leaves the office for an hour during the evening.`,questions:choices(24,30,null,3,true)},
    {id:'vn-w',title:'Writing · Three tasks',instructions:'Your writing is saved for self-checking and is not scored.',sourcePages:[],sourceText:`Task 1 — Building sentences. Make complete sentences. You may make necessary changes, but do not change the word order.
1 He / asked / secretary / type / letter / him.
2 Daisy / interested / watch / film.
3 I / love / food / I / dance / and / music / I / and / have / wonderful / time.
4 I / would like / see / Irish band / because / Celtic / music / good.
5 It / take / him / 30 minutes / finish / book.

Task 2 — Write a note asking your friend to buy you a box of coloured pencils. Say where she should buy it, when you need it, and how much money you want to spend. Write at least 35 words.

Task 3 — You have gone to Ha Noi Capital for a week. Write a postcard to one of your friends. Write at least 40 words.`,questions:[writing(31,0,true),writing(32,35,true),writing(33,40,true)]}
  ]}
]};

export const tests=[test1,test2,vn];
export const libraryFiles=[
  'a2-key-2020-listening-answer-key.pdf',
  'a2-key-2020-listening-question-paper.pdf',
  'a2-key-2020-listening.mp3',
  'a2-key-2020-reading-writing-answer-key.pdf',
  'a2-key-2020-reading-writing-question-paper.pdf',
  'a2-key-for-schools-2020-listening-answer-key.pdf',
  'a2-key-for-schools-2020-listening-question-paper.pdf',
  'a2-key-for-schools-2020-listening.mp3',
  'a2-key-for-schools-2020-reading-writing-answer-key.pdf',
  'a2-key-for-schools-2020-reading-writing-question-paper.pdf'
];
