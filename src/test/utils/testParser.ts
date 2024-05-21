const variantSigns = [
	"a",
	"b",
	"c",
	"d",
	"e",
	"f",
	"а",
	"б",
	"с",
	"д",
	"e",
	"г",
	"a",
	"b",
	"c",
	"d",
	"e",
	"f",
	"в",
	"е"
];
const separateSigns = [" ", ".", ")"];

interface IQuestion {
	description: string;
	variants: IVariant[];
}

interface IVariant {
	text: string;
	isCorrect: boolean;
}

function isQuestion(text: string) {
	const regex = /^\d+/;

	const questionNumber = text.match(regex)?.[0];

	return questionNumber;
}

function isVariant(text: string) {
	return (
		variantSigns.includes(text[0].toLowerCase()) &&
		separateSigns.includes(text[1])
	);
}

export function testParser(text: string) {
	console.log(text.split("\n"))
	const splittedText = text.split("\n").filter((chunk) => {
		const trimedChunk = chunk.trim();
		if (isQuestion(trimedChunk)) {
			if (trimedChunk.length > 6) {
				return trimedChunk;
			}
		} else {
			return trimedChunk;
		}
	});
	const questions: IQuestion[] = [];


	let question = "";
	for (let i = 0; i < splittedText.length; i++) {
		const trimedText = splittedText[i].trim();

		if (!isVariant(trimedText)) {
			question += trimedText;
		} else {
			let text = trimedText.slice(2);
			let variants: IVariant[] = [];
			for (let j = i + 1; j < splittedText.length; j++) {
				const trimedText = splittedText[j].trim();
				if (isVariant(trimedText)) {
					variants.push({
						text,
						isCorrect: false,
					});
					text = trimedText.slice(2);
				} else if (isQuestion(trimedText)) {

					variants.push({
						isCorrect: false,
						text,
					});

					variants[0].isCorrect = true;

					questions.push({
						description: question,
						variants,
					});

					question = "";
					variants = [];
					i = j - 1;
					break;
				} else {
					text += trimedText;
				}
			}
		}
	}

	return questions;
}
