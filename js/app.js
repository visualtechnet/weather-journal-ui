const weatherApiUrl = 'http://localhost:9000/.netlify/functions/api'

function loadJournal() {
    console.log('Loading')
    getJournal()
}

async function getJournal() {
    const journalEntries = await fetch(weatherApiUrl).then(res => res.json())

    displayJournalEntries(journalEntries)
}

function saveJournal() {

}

function displayJournalEntries(journalEntries) {
    const ulJournalEntries = document.querySelector('#journalEntries')
    const journalFragment = new DocumentFragment()

    for (const journal of journalEntries) {
        const liEntry = document.createElement('li')
        const pEntry = document.createElement('p')
        const { temperature, userResponse, date } = journal
        pEntry.innerHTML = `<span>${temperature} on ${moment(date).fromNow()}</span> -- <i>${userResponse}</i>`
        liEntry.appendChild(pEntry)
        journalFragment.appendChild(liEntry)
    }

    ulJournalEntries.appendChild(journalFragment)
}

document.addEventListener('DOMContentLoaded', loadJournal)