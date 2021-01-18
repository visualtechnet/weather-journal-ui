const weatherApiUrl = 'https://zen-wiles-e17b2d.netlify.app/.netlify/functions/api'
const apiKey = '153da925919bca743649e4d361c0ed8e'
const weatherIcon = 'https://openweathermap.org/img/wn/01d@2x.png'
const journalEntryStore = window.localStorage
const JOURNAL_ENTRIES = 'JOURNAL_ENTRIES'

const sortByMostRecent = (a, b) => {
    if (a.date < b.date) return 1
    else if (a.date > b.date) return -1
    else return 0
}

function loadJournal() {
	const journalStries = journalEntryStore.getItem(JOURNAL_ENTRIES)
	const generate = document.querySelector('#generate')
	if (journalStries !== null) {
		displayJournalEntries(JSON.parse(journalStries))
	} else {
		getJournal()
	}

	generate.addEventListener('click', saveJournal)
}

function refreshJournal() {
	journalEntryStore.removeItem(JOURNAL_ENTRIES)

	getJournal()
}

async function getJournal() {
	const journalEntries = await fetch(weatherApiUrl).then((res) => res.json())

	displayJournalEntries(journalEntries)
	journalEntryStore.setItem(JOURNAL_ENTRIES, JSON.stringify(journalEntries))
}

async function saveJournal(evt) {
	const zip = document.querySelector('#zip')
	await getWeatherByZip(zip.value)
		.then(persistTempWithJournal)
		.then((journal) => {
			const journalStries = journalEntryStore.getItem(JOURNAL_ENTRIES)
			const existingEntries =
				(journalStries && JSON.parse(journalStries)) || []
			const newEntries = [{ ...journal }]

            const mergedEntries = [...existingEntries, ...newEntries]
            const sortedEntries = mergedEntries.sort(sortByMostRecent)
			journalEntryStore.setItem(
				JOURNAL_ENTRIES,
				JSON.stringify(sortedEntries)
			)

			displayJournalEntries(sortedEntries)
		})
		.catch((err) => {
			alert(err)
        })

    evt.preventDefault();
    return false;
}

async function persistTempWithJournal(result) {
	const feelings = document.querySelector('#feelings')
	const journalEntry = Object.assign({}, result, {
		temperature: result && result.main.temp,
		date: moment(),
		userResponse: feelings.value
	})
	const journalResult = await fetch(weatherApiUrl, {
		method: 'POST',
		body: JSON.stringify(journalEntry),
		headers: {
			'Content-Type': 'application/json'
		}
	}).then((result) => result.json())

	return journalResult
}

async function getWeatherByZip(zip) {
	const openWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${zip}&units=imperial&appid=${apiKey}`
	return await fetch(openWeatherUrl).then((res) => res.json())
}

function displayJournalEntries(journalEntries) {
	const ulJournalEntries = document.querySelector('#journalEntries')
	const journalFragment = new DocumentFragment()

	//clear any entries in list
	ulJournalEntries.innerHTML = ''

	for (const journal of journalEntries) {
		const liEntry = document.createElement('li')
		const pEntry = document.createElement('p')
		const { temperature, userResponse, date, name, weather } = journal
		pEntry.innerHTML = `<span><b>${temperature}</b> in <b>${name}</b> on ${moment(date).format('MMM DD, YYYY hh:mm A')} with ${
			weather.length > 0 && weather[0].description
		} </span>. ... ${userResponse}.`
		liEntry.appendChild(pEntry)
		journalFragment.appendChild(liEntry)
	}

	ulJournalEntries.appendChild(journalFragment)
}

document.addEventListener('DOMContentLoaded', loadJournal)
