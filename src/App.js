import React, { useState, useRef, useEffect } from 'react'
import { quotesArray, random, allowedKeys } from './Helper'
import ItemList from './components/ItemList'
import './App.css'
import axios from 'axios'

let interval = null

const App = () => {
	const inputRef = useRef(null)
	const outputRef = useRef(null)
	const [duration, setDuration] = useState(180)
	const [started, setStarted] = useState(false)
	const [ended, setEnded] = useState(false)
	const [index, setIndex] = useState(0)
	const [correctIndex, setCorrectIndex] = useState(0)
	const [errorIndex, setErrorIndex] = useState(0)
	const [quote, setQuote] = useState({})
	const [input, setInput] = useState('')
	const [cpm, setCpm] = useState(0)
	const [wpm, setWpm] = useState(0)
	const [accuracy, setAccuracy] = useState(0)
	const [isError, setIsError] = useState(false)
	const [lastScore, setLastScore] = useState('0')
	const [username, setUser] = useState('')
	const myChangeHandler = (event) => {
		setUser(event.target.value)
	}
	const warnUser = () => {
		alert("Vui lòng nhập tên của bạn!")
	}
	useEffect(() => {
		const newQuote = random(quotesArray)
		setQuote(newQuote)
		setInput(newQuote.quote)
	}, [])

	const handleEnd = () => {
		setEnded(true)
		setStarted(false)

		clearInterval(interval)
	}

	const setTimer = () => {
		const now = Date.now()
		const seconds = now + duration * 1000
		interval = setInterval(() => {
			const secondLeft = Math.round((seconds - Date.now()) / 1000)
			setDuration(secondLeft)
			if (secondLeft === 0) {
				handleEnd()
			}
		}, 1000)
	}

	const handleStart = () => {
		setStarted(true)
		setEnded(false)
		setInput(quote.quote)
		inputRef.current.focus()
		setTimer()
	}

	const handleKeyDown = e => {
		e.preventDefault()
		const { key } = e
		const quoteText = quote.quote
		
		if (key === quoteText.charAt(index)) {
			setIndex(index + 1)
			const currenChar = quoteText.substring(index + 1, index + quoteText.length)
			setInput(currenChar)
			setCorrectIndex(correctIndex + 1)
			setIsError(false)
			outputRef.current.innerHTML += key
		} else {
			if (allowedKeys.includes(key) && /^[ -~]+$/.test( quoteText.charAt(index))) {
				setErrorIndex(errorIndex + 1)
				setIsError(true)
				outputRef.current.innerHTML += `<span class="text-danger">${key}</span>`
			}
		}

		const timeRemains = ((180 - duration) / 60).toFixed(2)
		const _accuracy = Math.floor((index - errorIndex) / index * 100)
		const _wpm = Math.round(correctIndex / 5 / timeRemains)

		if (index > 5) {
			setAccuracy(_accuracy <= 0 ? 0 : _accuracy)
			setCpm(correctIndex)
			setWpm(_wpm)
		}

		if (index + 1 === quoteText.length ) {
			setIndex(0)
			setInput(quote.quote)
			inputRef.current.focus()
		}
	}

	useEffect(
		() => {
			if (ended) {
				handleChange()
				localStorage.setItem('wpm', wpm)
			}
		},
		[ended, wpm]
	)
	useEffect(() => {
		const stroedScore = localStorage.getItem('wpm')
		if (stroedScore) setLastScore(stroedScore)
	}, [])
	const handleChange = () => {
		const rank = {
			name: username,
			wpm: wpm,
			error: errorIndex,
			accuracy: accuracy
		}
		// console.log(rank)
		axios.get('http://192.168.43.212:8080/rank?rank=' + JSON.stringify(rank))
	}
	return (
		<div className="App">
			<div className="container-fluid pt-4">

				<div className="row">
					{/* Left */}
					<div className="col-sm-6 col-md-2 order-md-0 px-5">
						<ul className="list-unstyled text-center small">
							<ItemList
								name="WPM"
								data={wpm}
								style={
									wpm > 0 && wpm < 20 ? (
										{ color: 'white', backgroundColor: '#eb4841' }
									) : wpm >= 20 && wpm < 40 ? (
										{ color: 'white', backgroundColor: '#f48847' }
									) : wpm >= 40 && wpm < 60 ? (
										{ color: 'white', backgroundColor: '#ffc84a' }
									) : wpm >= 60 && wpm < 80 ? (
										{ color: 'white', backgroundColor: '#a6c34c' }
									) : wpm >= 80 ? (
										{ color: 'white', backgroundColor: '#4ec04e' }
									) : (
															{}
														)
								}
							/>
							<ItemList name="CPM" data={cpm} />
							<ItemList name="Lịch sử" data={lastScore} />
						</ul>
					</div>
					{/* Body */}
					<div className="col-sm-12 col-md-8 order-md-1">
						<div className="container">
							<div className="text-center mt-4 header">
							<div className="row">
							<div className="column left">
								<img src="/logo-fpt.png" />
							</div>
							<div className="column middle">
								<h2>Vòng chung kết </h2>
								<h1>Cóc Cào Phím</h1>
							</div>
							<div className="column right">
								<img src="/logo.png" />
							</div>
							</div>
								<h3>Hello {username}</h3>
								<input
									type='text'
									onChange={myChangeHandler}
									placeholder="Nhập tên của bạn"
								/>
								<div className="alert alert-danger mt-4" role="alert">
									<strong>Lưu ý:</strong> Thí sinh tự chủ động chuyển đổi Unikey trong lúc gõ (mặc định <b>Ctrl-Shift</b>). Không được sử dụng phím <b>Xóa (Backspace)</b> để xóa kí tự bạn vừa gõ sai. Kí tự sai
									sẽ được tô màu <u>đỏ</u>. Nhấn phím <b>Cách (Space)</b> nếu gõ sai trong tiếng Việt. Chúc các bạn thi tốt!
								</div>

								<div className="control my-5">
									{ended ? (
										<button
											className="btn btn-outline-danger btn-circle"
											onClick={() => window.location.reload()}
										>
											Tải lại
										</button>
									) : started ? (
										<button className="btn btn-outline-success" disabled>
											Gõ nhanh lên
										</button>
									) : (
												<button className="btn btn-outline-success" onClick={username==="" ? warnUser : handleStart}>
													Bắt đầu!
												</button>
											)}
									<span className="btn-circle-animation" />
								</div>
							</div>

							{ended ? (
								<div className="bg-dark text-light p-4 mt-5 lead rounded">
									<span>"{quote.quote}"</span>
								</div>
							) : started ? (
								<div
									className={`text-light mono quotes${started ? ' active' : ''}${isError
										? ' is-error'
										: ''}`}
									tabIndex="0"
									onKeyDown={handleKeyDown}
									ref={inputRef}
								>
									{input}
								</div>
							) : (
										<div className="mono quotes text-muted" tabIndex="-1" ref={inputRef}>
											{input}
										</div>
									)}

							<div className="p-4 mt-4 bg-dark text-light rounded lead" ref={outputRef} />

							
							<hr className="my-4" />
							<div className="mb-5">
								<h6 className="py-2">Mức tham khảo tốc độ gõ trung bình</h6>
								<div className="d-flex text-white meter-gauge">
									<span className="col" style={{ background: '#eb4841' }}>
										0 - 20 Chậm
									</span>
									<span className="col" style={{ background: '#f48847' }}>
										20 - 40 Bình thường
									</span>
									<span className="col" style={{ background: '#ffc84a' }}>
										40 - 60 Nhanh
									</span>
									<span className="col" style={{ background: '#a6c34c' }}>
										60 - 80 Tuyệt vời
									</span>
									<span className="col" style={{ background: '#4ec04e' }}>
										80 - 100+ Xuất sắc
									</span>
								</div>
							</div>
						</div>
					</div>

					<div className="col-sm-6 col-md-2 order-md-2 px-5">
						<ul className="list-unstyled text-center small">
							<ItemList name="Thời gian" data={duration} />
							<ItemList name="Kí tự sai" data={errorIndex} />
							<ItemList name="Độ chính xác" data={accuracy} symble="%" />
						</ul>
					</div>
				</div>

				<footer className="small text-muted pt-5 pb-2 footer">
					<div className="footer-info text-center">
						<div className="copyright">
							© 2020. Designed and built with
							<span role="img" aria-label="Heart">
								{' '}
								❤️{' '}
							</span>
							by {' '}
							<a href="https://www.facebook.com/FCoderFUCT">
								FCoder club - FUCT
							</a>{' '}
						</div>
					</div>
				</footer>
			</div>
		</div>
	)
}

export default App
