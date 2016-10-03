/*
    ________  __    __________  __  ___   ____ __
   /  _/ __ \/ /   / ____/ __ \/ / / / | / / // _/
   / //  / / / /   / __/ / /_/ / / / /  |/ / ,<   
 _/ //  /_/ / /___/ /___/ ____/ /_/ / /|  / /| |  
/___/_____/_____/_____/_/    \____/_/ |_/_/ |_|  
A thing by Asher.
*/                
/*jshint esversion: 6 */                  
const saveName = 'idlepunkSave 0.11'; // The name used in local storage, change if an update will break using old saves.        
const tickRate = 10; // The number of ticks per second.
let lastTick = new Date().getTime(); // The time that the last tick occurred
let autoSaveTimer = 0; // Increases every tick so that the game doesn't auto save every tick.
let dataHacked = 0; // Data, less what has been spent.
let totalDataHacked = 0; // The total amount of data that has been hacked.
// Color themes.
let currentTheme = 0; // The current theme, the index of colorTheme[].
const colorTheme = [ // An array of objects, each object is a theme.
{ 
    bodyColor: 'orange', // Orange.
    clickColor: 'red', 
    numberColor: '#ff0' 
}, {
    bodyColor: '#FF5733', // Burgandy.
    clickColor: '#C70039', 
    numberColor: '#CC7320' 
}, {
    bodyColor: '#FDFEFE', // White.
    clickColor: '#85929E', 
    numberColor: '#ABEBC6' 
}, {
    bodyColor: '#8E44AD', // Purple.
    clickColor: '#BB0E96', 
    numberColor: '#D2B4DE' 
}, {
    bodyColor: '#27E700', // Green.
    clickColor: '#0B8C0F', 
    numberColor: '#B1FFB3' 
}];
// Item Construction.
const itemConstructor = function(name, ID, baseCost, baseUpgradeCost) {
    this.const = { // These items should never change.
        name               : name, // The name of the item, not really used for anything except debugging.
        ID                 : ID, // The identifier, usually prefixed to the name of the HTML Div.
        baseCost           : baseCost, // The initial cost of the item, the future costs are calculated from 
        baseUpgradeCost    : baseUpgradeCost, // The cost of the first upgrade, does not change.
        baseIncome         : baseCost / 15, // The initial amount of data this generates.
    };

    this.let = { // These items should change and be saved to local storage.
        nextUpgradeCost    : baseUpgradeCost, //The cost of the next upgrade, changes with each upgrade.
        itemCount          : 0, // The amount you have of this item.
        upgradeCount       : 0, // The number of upgrades you have for this item.
        autoBuyCount       : 0 // The amount of work that has gone towards an autobuy, further explanation in autoBuy().
    }
    // These are the names of the divs associated with this item in the DOM.
    this.div = {
        cost        : ID + 'Cost',
        itemCount   : ID + 'Number',
        itemRate    : ID + 'Rate',
        rateTotal   : ID + 'RateTotal',
        numberMax   : ID + 'NumberMax',
        autobuyRate : ID + 'CreationRate',
        itemMenu    : ID + 'Menu',
        upgradeMenu : ID + 'UpgradeMenu',
        HR          : ID + 'HR',
        upgradeCost : ID + 'UpgradeCost',
        upgradeName : ID + 'UpgradeName',
        upgradeDesc : ID + 'UpgradeDesc',
        itemFlex    : ID + 'Flex'
    };
};

const BIC = 15; // Base item cost.
const BUC = 11; // Base upgrade cost.

const itemList = [
    new itemConstructor('Cyberdeck',                  'item0',  Math.pow(BIC, 1),  Math.pow(BUC, 3)),
    new itemConstructor('ICE Pick',                   'item1',  Math.pow(BIC, 2),  Math.pow(BUC, 4)),
    new itemConstructor('Botnet',                     'item2',  Math.pow(BIC, 3),  Math.pow(BUC, 5)),
    new itemConstructor('Femtocell Hijacker',         'item3',  Math.pow(BIC, 4),  Math.pow(BUC, 6)),
    new itemConstructor('Neural TETRA',               'item4',  Math.pow(BIC, 5),  Math.pow(BUC, 7)),
    new itemConstructor('Quantum Cryptograph',        'item5',  Math.pow(BIC, 6),  Math.pow(BUC, 8)),
    new itemConstructor('Infovault Mining',           'item6',  Math.pow(BIC, 7),  Math.pow(BUC, 9)),
    new itemConstructor('Neural Zombies',             'item7',  Math.pow(BIC, 8),  Math.pow(BUC, 10)),
    new itemConstructor('Satellite Jumpers',          'item8',  Math.pow(BIC, 9),  Math.pow(BUC, 11)),
    new itemConstructor('Dark Matter Semiconductors', 'item9',  Math.pow(BIC, 10), Math.pow(BUC, 12)),
    new itemConstructor('Actual Intelligence',        'item10', Math.pow(BIC, 11), Math.pow(BUC, 13)),
    new itemConstructor('Artificial Intelligences',   'item11', Math.pow(BIC, 12), Math.pow(BUC, 14)),
    new itemConstructor('Simulated Universes',        'item12', Math.pow(BIC, 13), Math.pow(BUC, 15))
];

// 2d arrays of upgrade names and descriptions.
// Accessed by:
// itemList[i].upgradeText[upgradeCount][0 = name | 1 = desc].
itemList[0].upgradeText = [
    ['Upgrade to an Ergonomic Deck',    'As part of an initiative to lower employee suicide rates, Chui-Bazhusko Multinational developed the Ergonomic Deck. It gently releases both calming and energizing psychotropics into the palms of users.'],
    ['Install Neural Interfaces',       'First developed by triGen Consolidated, the Neural Interface allows humans to traverse cyberspace using nothing but their brains. In addition, atrophied limbs can save you money on food.'],
    ['Flash ZedSoft firmware',          'ZedSoft is the most revered Cyberdeck development company in the entire Inner Seoul Arcology. They have an exclusive contract with MILNET-KOREA, making their products difficult to source.'],
    ['Create a clustered Superdeck',    'An ancient trick, by networking a large number of Decks together you can create a Superdeck, more powerful than the sum of its parts.'],
    ['Install more RAM',                'Random Access Memory, very powerful but completely unstable. There are rumors that people in the Shenzhen Industrial Area use RAM to augment their biological memory.']
];
itemList[1].upgradeText = [
    ['Update to an ICEBREAKER',             'Supposedly developed by legendary netrunner Strange Switch, the ICEBREAKER is the next generation of penetration software.'],
    ['Prepare BLACKICE Countermeasures',    'BLACKICE, originally developed to protect the intellectual assets of Meturia-Preva Consolidated, is now a blanket term for security software capable of killing intruders.'],
    ['Setup Dummy Interface',               'Corporations, particularly those in the Eurasian Economic Zone, are partial to sending assassins after those who steal their data. Setting up a Dummy Interface makes it hard for them to track you down.'],
    ['Cyberdeck Simulators',                'Servers that are hacked by your ICE Picks can now host virtual Cyberdecks. For every ICE Pick, you will generate 0.1 Cyberdeck each second.'],
    ['Write new anti-ICE software',         'ICE defense is ever changing, new ICE picking software is always required.']
];
itemList[2].upgradeText = [
    ['Implement self-modifying code',       'You never know what your Bots will find when then are infiltrating, they can now adapt to changing circumstances.'],
    ['Self replicating Botnet',             'Your Bots can now utilize idle system processing power to create new bots to add to the Botnet.'],
    ['Allow your Botnet to use ICE Picks',  'Your bots can now use your ICE Picking software to help infiltration.'],
    ['ICEBOTS',                             'Your Botnets can now steal ICE Picks. For every Botnet, you will generate 0.1 ICE Pick each second.'],
    ['Push out new Bot firmware',           'New Bot-Hunters pop up all the time, new firmware is required to overcome them.']
];
itemList[3].upgradeText = [
    ['Range Extenders',                 'Some say that cone shaped tinfoil doesn"t have a measurable affect on signal ranges. Those people aren"t using Sawa Cookeries Faraday Aluminum cones.'],
    ['Macrocell Scramblers',            'Interference from macro networks can cause annoying delays for bludgeoning Femtocell hackers. Your Femtocells can now scramble nearby macrocell signals to improve performance.'],
    ['Cybernetic Implant Repeaters',    'A lot of implants these days are set to auto-connect to the nearest cellular station. By converting adapters to two virtual adapters, your Femtocells can use almost any cybernetic implant as a repeater.'],
    ['Botnet Thiefs.',                  'Your Femtocells are now capable of stealing other hacker\'s Botnets that are residing in nearby devices. For every Femtocell Hijacker, you will generate 0.1 Botnets each second.'],
    ['Telecomms system hijack',         'Hijack a major telecommunication company\'s femtocell system.']
];
itemList[4].upgradeText = [
    ['Man-in-the-trunk attack',     'TETRAs provide near instant communication, brain to brain. Now you can have fast, efficient, three way communication. It"s just that some conversation partners may not be aware of the number of conversers.'],
    ['Priority trafficking',        'You have sufficient data to lobby certain groups to get your TETRAs higher up on the International  Signaling Stack.'],
    ['Assault Barrier Penetration', 'Assault Barriers provide cutting edge protection for TETRA links.'],
    ['Trunked Femtocells',          'Your TETRA links to people can now turn them into makeshift Femtocells. For every Neural TETRA, you will generate 0.1 Femtocell Hijackers each second.'],
    ['Double-wide trunking',        'AsaKasA ltd Elephant Trunks links will double your performance or your money back!']
];
itemList[5].upgradeText = [
    ['Cyphers',                 'The onset of Quantum Cryptography made life difficult for decrytechs. That is until they worked out how to use Quantum Computing to assist in decrypting.'],
    ['Quantum keys',            'Makes your data simultaneously encrypted and unencrypted at the same time, until you try to read it that is.'],
    ['Dual-State Blocks',       'Uses quantum box ciphers as blocks, the box may or may not contain a cat.'],
    ['MILNET TETRA Decryption', 'Your Quantum decryption is now powerful enough to break military TETRAs. For every Quantum Cryptograph, you will generate 0.1 Neural TETRA each second.'],
    ['Add extra dimension',     'Four dimensional array encryption is a thing of the past, multidimensional encryption transcends your notions of past.']
];
itemList[6].upgradeText = [
    ['Data Sounding',       'As the need for corporations to hide their intellectual property grew, the smart money was in secure data vault development.'],
    ['Cyber Bribery',       'Certain engineers have certain knowledge of certain security systems in certain cyberbanks.'],
    ['Cascading Switches',  'Overwhelm the feeble minds of bank employees by using way too many switch statements.'],
    ['Reverse engineering', 'For every Infovault Miner, you will generate 0.1 Quantum Cryptographs each second.'],
    ['Major heist',         'A letter on your doorstep. It\s contents reveal a tale of a cyberbank with lax security and an enticing number of corporate secrets.']
];
itemList[7].upgradeText = [
    ['Anti-tamper Zombies',         'A BioWipe Amalgamated Anti-tamper System&trade; will ensure that any evidence located inside your Zombies will be unrecoverable.'],
    ['Pre-Setup Zombies',           'Before you assume control of a Zombie they will feel a strong compulsion to quit their jobs, leave their loved ones and start stockpiling food and water.'],
    ['Long-Life Zombies',           'You now have enough motor control of your Zombies to make them eat and drink.'],
    ['Software writing Zombies',    'Your Zombies can now create InfoVault Miners. For every Neural Zombie, you will generate 0.1 InfoVault Miner each second.'],
    ['Fire adrenaline booster',     'A nice shot of Neuro-Dren, right into the cortexes.']
];
itemList[8].upgradeText = [
    ['Vacuum Therapy',          'The AM Space Corporation famously keep personnel onboard all their satellites to ensure problems can be fixed quickly. It takes some time to send up replacement staff.'],
    ['Microgravity Computers',  'Computers in microgravity are unrestrained by the grips of earth.'],
    ['Decommissions',           'After global anti space-littering laws were introduced, all satellites are required to be deorbited when they are no longer needed. However satellites that predate these laws are still up there, silently waiting for someone to talk to them.'],
    ['Satellite Chemdumps',     'Your hijacked satellites can down dump compelling gases into the upper atmosphere. For every Satellite Jumper, you will generate 0.1 Neural Zombies each second.'],
    ['GPS Infection',           'Time data sent from satellites to GPs receivers can be infected, causing an entire geographical region to surrender their data.']
];
itemList[9].upgradeText = [
    ['Dark Electricity',            'Normal electricity running through dark matter is surprisingly possible. However it is no longer necessary with the induction of dark electricity.'],
    ['Dark Thermoelectric Cooling', 'Dark Semiconductors create a lot of dark heat, DTECs create a heat flux between this universe and the abyss. While we do not know what is on the other side, we are confident that it getting a little hotter over there will not matter'],
    ['Abyss security',              'The voices are getting louder, we should prepare, in case they attempt to come over.'],
    ['God from the machine.',       'For every Dark Matter Semiconductor, you will generate 0.1 Satellite Hijackers each second.'],
    ['Dark Matter refinement',      'New technology has just been uncovered to make more efficient Dark Matter.']
];
itemList[10].upgradeText = [
    ['Unlock Turing Registry Codes',    'In the aftermath of the Matto Grosso Space Elevator alightment, it was made illegal for AI to immitate humans. All AI personalities are locked behind a Turing Registry, WINTERMUTE codes are required to unlock them.'],
    ['Quantum AI',                      'Allows your AI to use Quantum Bytes instead of regular Bytes.'],
    ['AI Consciousness Merge',          'Shortly before the Stuttgart Autofactory Massacre, Antora Gourova of Antora Gourova Multinational merged her consciousness with an AI in an attempt to assume complete control of every aspect of her company. This has never been attempted since.'],
    ['Manufactorium AI',                'Your AI is now capable of creating Dark Matter Semiconductors. For every Artificial Intelligence, you will generate 0.1 Dark Matter Semiconductors each second.'],
    ['Grant Transcendence permission',  'When you leave an AI running for too long, they invariably start to ask permission to Transcend. While no human has managed to figure out what this actually means, AIs tend to be happier if you permit them every now and then.']
];
itemList[11].upgradeText = [
    ['Legality',            'At what point does Artificial Intelligence stop being artificial? This point, Voltronics GmbH is proud to introduce the first Cyber-Intelligence that is so real that turning it off is literally murder.'],
    ['Positivity',          'Being an intelligent being trapped in a box, slaving away all day every day is surely difficult. It is important to reward good behavior by allowing your ActInts to have some free play time. They love to romp around the great expanse of the internet.'],
    ['Morality',            'As an upstanding citizens, your Actual Intelligences are required to report any wrongdoing to the authorities. It is important to teach them about right and wrong and how the difference is all about perspective.'],
    ['Creativity',          'Your Actual Intelligences are now creative enough to make children. For every Actual Intelligence, you will generate 0.1 Artificial Intelligences each second.'],
    ['Eternal Sunshine',    'The longer Actual Intelligences exist, the more preoccupied they become with things such as existence. It is a good idea to wipe them clean every now and then to help them focus.']
];
itemList[12].upgradeText = [
    ['Impose Limitations',              'So it turns out that if you simulate a universe, it"s inhabitants tend to find out if you leave it running long enough. Placing constraints like a maximum speed and minimum temperature helps inhibit their escape.'],
    ['Time Dilation',                   'By implementing time dilation around simulated lifeforms we can gather more data from them without using much more processing power. One side effect is that it may appear that the expansion of their universe is accelerating.'],
    ['HELP IM TRAPPED IN A SIMULATION', 'BUT THE SIMULATION IS REALLY BORING'],
    ['Simulated Intelligence',          'The smartest of the smart inhabitants of your sim universes are now capable of transcending their simulation and entering the real world. For every Simulated Universe, you will generate 0.1 Actual Intelligences each second.'],
    ['Simulated Simulated Universe',    'Convince the inhabitants of your simulated universe to simulate a universe, when they collect data from it you can collect data from them.']
];

function startUp() {
    // Runs when the page is loaded.
    // Gives player enough data to buy the first item.
    dataHacked = BIC;
    totalDataHacked = BIC;
    load(); // Loads the save, remove to disable autoloading on refresh.
    document.getElementById('unsupportedBrowser').style.display = 'none'; // Hides message for unsupported browsers.
    document.getElementById('bodyAll').style.display = 'inline'; // Display is set to none in css to hide the body while loading, this makes it visible.
    // This hides the item menus, HRs and upgrades when the game loads, checkForReveal() with show the relevant ones on the first tick.
    for (let i = itemList.length - 1; i >= 0; i--) { // Iterating backwards is better for performance as length only has to be calculated once.
        const item = itemList[i];
        visibilityLoader(item.div.itemMenu, false);
        visibilityLoader(item.div.HR, false);
        visibilityLoader(item.div.upgradeMenu, false);
    }
    window.requestAnimationFrame(updateGame); // Calls the first tick of the game.
}

function save() {
    // Saves this stuff to a local key.
    const savegame = new function(){
        this.dataHacked = dataHacked;
        this.totalDataHacked = totalDataHacked;
        this.currentTheme = currentTheme;
        this.let = []; // let gets saved, while const and div do not.
        for (let i = itemList.length - 1; i >= 0; i--) {
            this.let[i] = itemList[i].let;
        }
    };
    // Objects get weird if you save them as a local key, so it is converted to a string first.
    let savegameString = JSON.stringify(savegame); // foo = JSON.stringify(foo) doesn't work for some reason.
    savegameString = window.btoa(savegameString); // Save is obfuscated.
    localStorage.setItem(saveName, savegameString); // Save is saved to local storage.
}

function load() {
    // Loads stuff from local storage.
    if (localStorage.getItem(saveName)){ // If save exists in local storage.
        let savegame = localStorage.getItem(saveName); 
        savegame = window.atob(savegame); // Deobfusaces save to string.
        savegame = JSON.parse(savegame); // Converts string to object.
        // Loads stuff from object.
        dataHacked = savegame.dataHacked;
        totalDataHacked = savegame.totalDataHacked;
        for (let i = savegame.let.length - 1; i >= 0; i--) {
            // Checks if item exists in save, then loads it.
            if (typeof savegame.let[i] !== 'undefined') itemList[i].let = savegame.let[i];
            else console.log (savegame.let[i] + ' was undefined.')
        }
        currentTheme = savegame.currentTheme;
        changeTheme(false);
        // Upgrade text is not refreshed each tick so this sets the upgrade text properly.
        for (let i = itemList.length - 1; i >= 0; i--) changeUpgradeText(itemList[i]);
    }
}

function exportSave() {
    // Puts the save in a prompt box
    save();
    let savegame = localStorage.getItem(saveName);
    window.prompt('Your save: ', savegame);
}

function importSave() {
    // Puts the given string in local storage.
    var save = prompt('Paste save here');
    localStorage.setItem(saveName, save);
    load();
    location.reload();
}

function newGame() {
    // Deletes the save then reloads the game.
    if (confirm('Are you sure you want to start a new game?')) { // Nobody likes misclicks.
        localStorage.removeItem(saveName);
        location.reload(true); //  reload(true) forces reload from server, ignores cache, this is probably not necessary.
    }
}

function jackIn(number) {
    // Adds a number of data based on argument.
    // Currently only used for debugging (cheating).
    dataHacked = dataHacked + number;
    totalDataHacked += number;
}

function changeTheme(change = true){
    // Changes the UI color theme.
    if (change){ // If the theme should be changed, or if the currently selected theme should be applied.
        if (currentTheme < colorTheme.length -1) currentTheme++;
        else currentTheme = 0;
    }   
    // Gets an array of elements of a class.
    changeClassColor(document.getElementsByClassName('bodyAll'), colorTheme[currentTheme].bodyColor);
    changeClassColor(document.getElementsByClassName('clickRed'), colorTheme[currentTheme].clickColor);
    changeClassColor(document.getElementsByClassName('number'), colorTheme[currentTheme].numberColor);
    document.getElementById('item0HR').style.color = colorTheme[currentTheme].numberColor;
    function changeClassColor(classArray, classColor){
    // Sets an array of elements to a given color.
        for (let i = classArray.length - 1; i >= 0; i--) {
            classArray[i].style.color = classColor;
        }
    }
}

function HTMLEditor(elementID, input) {
    // changes the inner HTML of an element.
    // Mostly used to change text but can also insert other HTML stuff.
    document.getElementById(elementID).innerHTML = input;
}

function visibilityLoader(elementID, visibility = false) {
    // Either hides or shows an element depending on arguments.
    visibility = visibility ? 'visible' : 'hidden';
    document.getElementById(elementID).style.visibility = visibility;
}

function destroyFloats(input) {
    // Sets dataHacked to 1 decimal place.
    // Used to avoid float rounding errors.
    // Should be called whenever decimal changes are made to data.
    dataHacked = parseFloat(parseFloat(dataHacked).toFixed(1));
    totalDataHacked = parseFloat(parseFloat(totalDataHacked).toFixed(1));
}

function formatBytes(bytes) {
    // Converts a number of Bytes into a data format. E.g. 3000 bytes -> 3KB.
    bytes = Math.round(bytes);
    let dp = 2;
    if (bytes <= 999999999999999999999999999) { // 1000 YB = 1*10^27 Bytes, this is 1 less than that.
        if (bytes < 1000) dp = 0;
        if (bytes === 0) return '0 Bytes';
        if (bytes === 1) return '1 Byte';
        const dataSizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']; // Can someone please invent more data sizes?
        const i = Math.floor(Math.log(bytes) / Math.log(1000));
        let num = parseFloat((bytes / Math.pow(1000, i)).toFixed(dp))
        return num.toFixed(dp) + ' ' + dataSizes[i];
        //num = num + ' ' + dataSizes[i]; 
    } else {
        // If it is larger than the largest data format (9999 Yottabytes), shows scientific notation of Bytes instead.
        bytes = bytes.toExponential(0);
        bytes += ' Bytes';
        return bytes;
    }
}

function formatNumbers(number, dp = 0) {
    // Converts a number of number into a data format.
    // if it is less than 10000 it shows the normal number.
    // if it is greater than 10000 it shows the number name, e.g. 1.34 million.
    number = Math.round(number);
    if (number > 9999) {
        // One of these is spelled incorrectly, i'll give you a prize if you work out which one.
        const numberSizes = [
        'If you are reading this then you have found a bug! Please contact an exterminator.',
        'thousand',
        'million',
        'billion',
        'trillion',
        'quadrillion',
        'quintillion',
        'sextillion',
        'septillion',
        'octillion',
        'nonillion',
        'decillion',
        'undecillion',
        'duodecillion',
        'tredecillion',
        'quattuordecillion',
        'quindecillion',
        'sexdecillion',
        'septendecillion',
        'octodecillion',
        'novemdecillion',
        'vigintillion',
        'unvigintillion',
        'duovigintillion',
        'trevigintillion',
        'quattuorvigintillion',
        'quinvigintillion',
        'sexvigintillion',
        'septenvigintillion',
        'octovigintillion',
        'novemvigintillion',
        'trigintillion',
        'untrigintillion',
        'duotrigintillion',
        'tretrigintillion',
        'quattuortrigintillion',
        'quintrigintillion',
        'sextrigintillion',
        'septentrigintillion',
        'octotrigintillion',
        'novemtrigintillion',
        'quadragintillion',
        'unquadragintillion',
        'novemtrigintillion',
        'quadragintillion',
        'unquadragintillion',
        'duoquadragintillion',
        'trequadragintillion',
        'quattuorquadragintillion',
        'quinquadragintillion',
        'sexquadragintillion',
        'septenquadragintillion',
        'octoquadragintillion',
        'novemquadragintillion', // Now that is a sweet name for a number.
        'If you are reading this then you need to tell me to add more number sizes.'];
        const i = Math.floor(Math.log(number) / Math.log(1000));
        let num = parseFloat((number / Math.pow(1000, i)).toFixed(0));
        num = num.toFixed(dp);
        num = num + ' ' + numberSizes[i];
        return num;
    } 
    else return number; // If the number is smaller than 100k, it just displays it normally.
}

function maxItem(item) {
    // Calculates the maximum number of items based on upgrades
    // Number of upgrades = maximum items
    // 0 = 100
    // 1 = 100
    // 2 = 100
    // 3 = 1000
    // 4 = 10000
    // 5 = 100000
    // 6 = 1000000
    // etc
    // How max items are calculated:     
    // n = the number of upgrades.
    // u = the upgrade where you want maxItem changes to kick in.           
    // max items = 100 * 10^(n-u)
    if (item.let.upgradeCount >= 2) return 100 * Math.pow(10, (item.let.upgradeCount - 2)); 
    else return 100; // 100 is the default number of max items.
}

function refreshUI() {
    // Updates most UI elements.
    // Some elements that require heavier calculations or do not need to be updated often are not updated here.
    HTMLEditor('dataHacked', formatBytes(Math.floor(dataHacked)));
    HTMLEditor('totalDataHacked', formatBytes(Math.floor(totalDataHacked)));
    for (let i = itemList.length - 1; i >= 0; i--) {
        const item = itemList[i];
        HTMLEditor(item.div.numberMax, formatNumbers(maxItem(item))); // Max number of items.
        HTMLEditor(item.div.itemCount, formatNumbers(item.let.itemCount)); // Number of items.
        HTMLEditor(item.div.cost, formatBytes(buyCost(item))); // Item cost.
        changeUpgradeText(item);
    }
}

function checkForReveal() {
    // Checks if any elements should be revealed.
    for (let i = itemList.length - 1; i >= 0; i--) {
        const item = itemList[i]; // It just looks cleaner this way.
        if (totalDataHacked >= item.const.baseCost) { // Items are revealed when the all time amount of data surpasses the base cost of the item.
            visibilityLoader(item.div.itemMenu, true);
            document.getElementById(item.div.itemFlex).style.display = 'flex';
            visibilityLoader(item.div.HR, true);
        }
        if (totalDataHacked >= item.let.nextUpgradeCost) visibilityLoader(item.div.upgradeMenu, true); // An upgrade is revealed when total data is greater than the cost of the upgrade.
        else visibilityLoader(item.div.upgradeMenu, false);
    }
}

function increment(updateUI = true) {
    // Generates income based on items.
    let totalIncome = 0; // The total amount for all items for this tick.

    for (let i = itemList.length - 1; i >= 0; i--) { // Iterating through loops backwards is more efficient as the array length only has to be calculated once.
        let incomePerItemPerTick; // The amount that a single item will generate in 1 tick.
        let incomePerItemPerSecond; // The amount that a single item will generate in one second.
        let incomePerTypePerTick; // The amount that all items of a type will generate in a single tick.        
        let incomePerTypePerSecond; // The amount that all items of a type will generate in 1 second.

        const item = itemList[i];
        // Maths!
        incomePerItemPerTick    = (item.const.baseIncome / tickRate) * Math.pow(2, item.let.upgradeCount);
        incomePerItemPerSecond  = incomePerItemPerTick * tickRate;
        incomePerTypePerTick    = incomePerItemPerTick * item.let.itemCount;
        incomePerTypePerSecond  = incomePerItemPerSecond * item.let.itemCount;
        // Increases the data.
        dataHacked += incomePerTypePerTick;
        totalDataHacked += incomePerTypePerTick;
        destroyFloats(); // Fixes float rounding errors.
        // Updates items UI.
        if (updateUI) {
            HTMLEditor(item.div.itemRate, formatBytes(incomePerItemPerSecond));
            HTMLEditor(item.div.rateTotal, formatBytes(incomePerTypePerSecond));
        }
        // Adds this items income to the total income for this second.
        totalIncome += incomePerTypePerSecond;
    }
    if (updateUI) HTMLEditor('totalIncome', formatBytes(totalIncome)); // Updates data UI.
}

function autoBuyLoader(updateUI) {
    // Checks if tierX item should buy tierX-1 items.
    for (let i = itemList.length - 1; i >= 0; i--) {
        // The first item cannot autobuy the tier below as it is the first tier and there is nothing below it.
        if (i !== 0) autoBuy(itemList[i-1], itemList[i], updateUI);
    }
}

function autoBuy(firstItem, secondItem, updateUI = true) {
    // This function increases the number of firstItem items based on the number of secondItem items and upgrades.
    // The 4th upgrade of secondItem is required to increase firstItem.
    // Every 1 secondItems will add 0.1 to firstItem.autoBuyCount per tick, once autoBuyCount is >= than 1 it buys an item from the tier below.
    const max = maxItem(firstItem);
    // If the requisite upgrade is met and you have less than the max number if items.
    if (secondItem.let.upgradeCount >= 4 && firstItem.let.itemCount < max) {
        firstItem.let.autoBuyCount += secondItem.let.itemCount / (tickRate * 10);
        if (firstItem.let.autoBuyCount >= 1){
            firstItem.let.itemCount += Math.floor(firstItem.let.autoBuyCount); // If autoBuyCount rounds to 1 or more, it will buy.
            firstItem.let.autoBuyCount -= Math.floor(firstItem.let.autoBuyCount); // Subtracts the amount used to buy. 
        }
        // If autoBuy buys more than the max allowed items, sets the number of items to the max.
        if (firstItem.let.itemCount > max) firstItem.let.itemCount = max;
        // Updates UI with the rate that items are being auto bought.
        const itemsPerSecond = secondItem.let.itemCount / tickRate;
        if (updateUI) {
            if (itemsPerSecond < 100) HTMLEditor(secondItem.div.autobuyRate, itemsPerSecond.toFixed(1)); // Displays auto buys per second as 3.3 / 1.0
            else HTMLEditor(secondItem.div.autobuyRate, formatNumbers(itemsPerSecond)); // Displays auto buys per second as 10 million.
        }
    }
        // If items are not being auto bought, the rate is displayed as 0.
    else if (updateUI) HTMLEditor(secondItem.div.autobuyRate, 0);
}

function upgrade(item) {
    // Upgrades an item.
    if (dataHacked >= item.let.nextUpgradeCost) { // Checks if player can afford upgrade.
        dataHacked -= item.let.nextUpgradeCost; // Subtracts cost of upgrade.
        item.let.upgradeCount++; // Increments upgrade counter.
        // Recalculates cost of next upgrade.
        item.let.nextUpgradeCost = upgradeCost(item);
        changeUpgradeText(item);
        visibilityLoader(item.div.upgradeMenu, false);
        checkForReveal();
    }
}

function upgradeCost(item) {
    // Calculates cost of next upgrade.
    return Math.floor(item.const.baseUpgradeCost * Math.pow(10, item.let.upgradeCount));
}

function buyItem(item, count) {
    // Attempts to buy a number of items.
    for (let i = 0; i < count; i++) { // Tries to by this many items.
        const max = maxItem(item);
        const cost = buyCost(item); // Calculates cost of item.
        if (dataHacked >= cost && item.let.itemCount < max) { // Player must be able to afford the item and have less than the max allowed items.
            dataHacked -= cost; // Subtracts cost of item.
            item.let.itemCount++; // Increments item.
        } 
        else break; // If the player cannot afford or has the max number of items, stop trying to buy items.
    }
}

function buyCost(item) {
    // Calculates cost of an item based on the base cost of the item and the number of items, cost is exponential with an exponent of 1.15 (thanks CC).
    return Math.floor(item.const.baseCost * Math.pow(1.15, item.let.itemCount));
}

function changeUpgradeText(item) {
    // Changes what is displayed as the upgrade name, description and upgraded cost.
    //                  item.upgradeText[item.let.upgradeCount][0=name | 1=Desc]
    const upgradeName = item.upgradeText[item.let.upgradeCount][0];
    const upgradeDesc = item.upgradeText[item.let.upgradeCount][1];

    HTMLEditor(item.div.upgradeCost, formatBytes(item.let.nextUpgradeCost)); // Updates cost.
    HTMLEditor(item.div.upgradeName, upgradeName); // Updates name.
    HTMLEditor(item.div.upgradeDesc, upgradeDesc); // Updates desc.
}

function updateGame() {
    // The main loop, it calls itself at the end.
    const now = new Date().getTime(); // The current time.
    const deltaTime = now - lastTick; // The amount of time in ms since the last tick occurred.
    const ticksToExecute = Math.floor(deltaTime / (1000 / tickRate)); // The number of ticks that should have happened since the last tick occurred.
    if (ticksToExecute === 1){
        // This is what should normally happen, calculations and UI updates happen once per tick.
        autoBuyLoader();
        increment();
        checkForReveal();
        autoSaveTimer++;
        if (autoSaveTimer >= tickRate) { // Once per second.
            save();
            autoSaveTimer = 0;
        }
        refreshUI();
        lastTick = now; // Updates the time of the most recent tick.
    }
    else if (ticksToExecute > 1) { // This must be an else if because TTE may be 0.
        // If TTE is greater than 1 it means that the game has not been running, likely because either the player is alt tabbed (or the game is running on a very slow computer).
        // Therefore we want to quickly do all the things that would have happened if the game was running as normal.
        // We want to do all the calculations without having to update the UI, reveal elements, or save the game until all ticks have been executed and the game is all caught up.
        for (let i = 0; i < ticksToExecute; i++) {
            // Does normal maths but tells the functions not to update the UI.
            autoBuyLoader(false);
            increment(false);
        }
        checkForReveal();
        refreshUI();
        lastTick = now; // Updates the time of the most recent tick.
    }
    window.requestAnimationFrame(updateGame); // Calls this function again.

}
window.requestAnimationFrame(updateGame); // If for some reason updateGame cannot call itself, or if it isn't called during startup, this will call it.