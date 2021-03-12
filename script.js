import { frequencies } from "./frequencies.js";

function runStart() {
	mask.style.display = "none";
	button.style.display = "none";

	let filters = null;
	const ctx = new AudioContext();
	const fadersElement = document.getElementById("faders");

	const createLabel = (freq) => {
		const label = document.createElement("label");
		label.setAttribute("class", "label");
		label.innerText = (freq + "").length > 3 ? freq / 1000 + "k" : freq;
		return label;
	};

	const createSlider = (i) => {
		const slider = document.createElement("div");
		slider.setAttribute("class", "slider");
		slider.setAttribute("name", "slider");
		slider.setAttribute("id", i);
		return slider;
	};

	const createFader = (i, freq) => {
		const label = createLabel(freq);
		const slider = createSlider(i);
		const fader = document.createElement("div");
		fader.setAttribute("class", "fader");
		fader.appendChild(slider);
		fader.appendChild(label);
		return fader;
	};

	const createEqElement = () => {
		frequencies.map((freq, i) => {
			const fader = createFader(i, freq);
			fadersElement.appendChild(fader);
		});
	};

	const createFilter = (freq) => {
		const filter = ctx.createBiquadFilter();
		filter.frequency.value = freq;
		filter.gain.value = 0;
		filter.type = "peaking";
		filter.Q.value = 0.3;
		return filter;
	};

	const connetFilters = () => {
		filters.forEach(({ filter }, i) => {
			if (i < filters.length - 1) {
				filter.connect(filters[i + 1].filter);
			}
		});
	};

	const createEq = () => {
		filters = frequencies.map((freq, i) => {
			return { id: i, filter: createFilter(freq) };
		});
		connetFilters();
	};

	const update = (id, gain) => {
		const filter = filters.filter((filter) => filter.id === +id)[0].filter;
		filter.gain.value = +gain;
	};

	const bindEvents = () => {
		let mouseDown = false;
		fadersElement.addEventListener("mousedown", () => (mouseDown = true));
		window.addEventListener("mouseup", () => (mouseDown = false));
		window.addEventListener("mousemove", (e) => {
			if (!mouseDown) {
				return;
			}
			for (const fader of fadersElement.children) {
				const slider = fader.firstElementChild;
				const faderRect = fader.getBoundingClientRect();
				const sliderRect = slider.getBoundingClientRect();
				if (e.clientX > faderRect.left && e.clientX < faderRect.right) {
					const top = Math.min(faderRect.height - sliderRect.height, Math.max(0, e.clientY - faderRect.top));
					slider.style.top = top + "px";
					update(slider.id, -(top / 160 - 0.5) * 24);
				}
			}
		});
	};

	createEqElement();
	createEq();
	bindEvents();

	const audioElement = document.getElementById("source");
	const source = ctx.createMediaElementSource(audioElement);
	const gainNode = ctx.createGain();
	const firstFilter = filters[0].filter;
	const lastFilter = filters[filters.length - 1].filter;

	source.connect(gainNode);
	gainNode.connect(firstFilter);
	lastFilter.connect(ctx.destination);
}

const mask = document.getElementById("mask");
const button = document.getElementById("btn");
button.onclick = () => runStart();
