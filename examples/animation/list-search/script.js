const cards = [
    { title: 'Madame Bovary', subtitle: 'Gustave Flaubert', description: `"Il y a peu de femmes que, de tête au moins, je n'aie déshabillées jusqu'au talon. J'ai travaillé la chair en artiste et je la connais. Quant à l'amour, ç'a été le grand sujet de réflexion de toute ma vie. Ce que je n'ai pas donné à l'art pur, au métier en soi, a été là et le cœur que j'étudiais c'était le mien."` },
    { title: 'Le Rouge et le Noir', subtitle: 'Stendhal', description: `Fils de charpentier, Julien Sorel est trop sensible et trop ambitieux pour suivre la carrière familiale dans la scierie d’une petite ville de province. En secret, il rêve d’une ascension similaire à celle de Napoléon Bonaparte. Julien trouve une place de précepteur dans la maison du maire, Monsieur de Rénal, et noue une relation interdite avec son épouse. Jusqu’au bout, Julien Sorel verra ses ambitions contrecarrées par ses sentiments, qui les conduiront à sa perte...` },
    { title: 'Une Vie', subtitle: 'Guy de Maupassant', description: `À dix-sept ans, radieuse, prête à toutes les joies, à tous les hasards, Jeanne quitte enfin le couvent. Dans le désœuvrement des jours et la solitude des espérances, de toutes ses rênes, le plus impatient est celui de l'amour...` },
    { title: 'Les Fleurs du Mal', subtitle: 'Charles Baudelaire', description: `Avec Les Fleurs du Mal commence la poésie moderne : le lyrisme subjectif s'efface devant cette « impersonnalité volontaire » que Baudelaire a lui-même postulée ; la nature et ses retours cycliques cèdent la place au décor urbain et à ses changements marqués par l'Histoire, et il arrive que le poète accède au beau par l'expérience de la laideur. Quant au mal affiché dès le titre du recueil, s'il nous apporte la preuve que l'art ici se dénoue de la morale, il n'en préserve pas moins la profonde spiritualité des poèmes.` },
    { title: 'L\'Amant', subtitle: 'Marguerite Duras', description: `Roman autobiographique mis en image par Jean-Jacques Annaud, "L'amant" est l'un des récits d'initiation amoureuse parmi les plus troublants qui soit. Dans une langue pure comme son sourire de jeune fille, Marguerite Duras confie sa rencontre et sa relation avec un rentier chinois de Saigon.` },
    { title: 'L\'Étranger', subtitle: 'Albert Camus', description: `Quand la sonnerie a encore retenti, que la porte du box s'est ouverte, c'est le silence de la salle qui est monté vers moi, le silence, et cette singulière sensation que j'ai eue lorsque j'ai constaté que le jeune journaliste avait détourné les yeux. Je n'ai pas regardé du côté de Marie. Je n'en ai pas eu le temps parce que le président m'a dit dans une forme bizarre que j’aurais la tête tranchée sur une place publique au nom du peuple français....` },
    { title: 'L\'Écume des jours', subtitle: 'Boris Vian', description: `Dans un univers mêlant quotidien et onirisme, ce premier roman conte les aventures de Colin, de Chick, d’Alise et de la belle Chloé. Deux histoires d’amour s’entremêlent : Colin est un jeune homme élégant, rentier, qui met fin à son célibat en épousant Chloé, rencontrée à une fête, tandis que son ami Chick, fanatique transi du philosophe vedette Jean-Sol jk, entretient une relation avec Alise. ` },
    { title: 'Candide', subtitle: 'Voltaire', description: `Le XVIIIe siècle n'est pas seulement le siècle de la philosophie. C'est aussi, et peut-être avant tout, le siècle du voyage et de l'exotisme, une période d'affirmation de soi où l'Orient permet d'accéder à l'essence humaine. Somme des expériences de Voltaire en 1759, Candide est l'expression mythique d'un itinéraire personnel.` },
    {
        title: 'Les Confessions', subtitle: 'Jean-Jacques Rousseau', description: `"Je forme une entreprise qui n'eut jamais d'exemple et dont l'exécution n'aura point d'imitateur. Je veux montrer à mes semblables un homme dans toute la vérité de la nature ; et cet homme ce sera moi. Moi, seul. Je sens mon cœur et je connais les hommes. Je ne suis fait comme aucun de ceux que j'ai vus ; j'ose croire n'être fait comme aucun de ceux qui existent. Si je ne vaux pas mieux, au moins je suis autre."`
    },
    {
        title: 'Antigone', subtitle: 'Jean Anouilh', description: `Après Sophocle, Jean Anouilh reprend le mythe d'Antigone. Fille d'Oedipe et de Jocaste, la jeune Antigone est en révolte contre la loi humaine qui interdit d'enterrer le corps de son frère Polynice. Présentée sous l'Occupation, en 1944, l'Antigone d'Anouilh met en scène l'absolu d'un personnage en révolte face au pouvoir, à l'injustice et à la médiocrité.`
    }
]

const listEl = document.getElementById('list');
const discardEl = document.getElementById('discard');
const inputEl = document.querySelector('input[type="search"]');

inputEl.addEventListener('input', e => {
    buildCards(e.target.value)
})

buildCards('')


function buildCards(search) {

    let existingCards = Array.from(document.querySelectorAll('li.list-item'));
    document.getElementById('found-count').textContent = cards.length;
    if (existingCards.length === 0) {
        let index = 0;
        for (const card of cards) {
            const li = document.createElement('li');
            li.classList.add('list-item');
            li.setAttribute('lang', 'fr');
            li.style.setProperty('--vt-name', `item${index}`)
            li.innerHTML = `<h2 class="mdf-title4 item-title">${card.title}</h2><div class="item-author">${card.subtitle}</div><p class="item-description">${card.description}</p>`
            listEl.append(li);
            index++;
        }
    } else {
        const cardHeight = existingCards[0].getBoundingClientRect().height;
        const discarded = existingCards.filter(c => ![c.querySelector('.item-author').textContent, c.querySelector('.item-title').textContent].some(str => str.toLowerCase().includes(search.toLowerCase())))
        discardEl.style.minHeight = discarded.length > 0 ? `${cardHeight + (cardHeight - (3 * 16)) * (discarded.length - 1)}px` : '0px';

        document.getElementById('not-found-count').textContent = discarded.length;
        document.getElementById('found-count').textContent = existingCards.length - discarded.length;

        document.startViewTransition(() => {
            let discardIndex = 0;
            existingCards.forEach(cardEl => {
                const isMatch = [cardEl.querySelector('.item-author').textContent, cardEl.querySelector('.item-title').textContent].some(str => str.toLowerCase().includes(search.toLowerCase()));

                if (isMatch) {
                    cardEl.classList.remove('no-match');
                    if (discardEl.contains(cardEl)) {
                        listEl.appendChild(cardEl);
                    }
                } else {
                    cardEl.classList.add('no-match');
                    cardEl.style.setProperty('--di', discardIndex)
                    if (listEl.contains(cardEl)) {
                        discardEl.appendChild(cardEl);
                    }
                    discardIndex++;
                }
            })
        });
    }
}