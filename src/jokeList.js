import React, { Component } from 'react';
import axios from 'axios';
import './jokeList.css';
import Joke from './joke';
import uuid from 'uuid/v4';

class JokeList extends Component {
	static defaultProps = {
		numJokesToGet: 10
	};
	constructor(props) {
		super(props);
		this.state = {
			jokes: JSON.parse(window.localStorage.getItem('jokes')) || '[]',
			loading: false
		};
		this.seenJoke = new Set(this.state.jokes.map((j) => j.joke));
		this.handleClick = this.handleClick.bind(this);
	}
	componentDidMount() {
		if (this.state.jokes.length === 0) this.getJokes();
	}
	async getJokes() {
		try {
			let jokes = [];
			while (jokes.length < this.props.numJokesToGet) {
				let jokesUrl = 'https://icanhazdadjoke.com/';
				let jokesRes = await axios.get(jokesUrl, { headers: { Accept: 'application/json' } });
				let newJoke = jokesRes.data.joke;
				if (!this.seenJoke.has(newJoke)) {
					jokes.push({ id: uuid(), joke: newJoke, votes: 0 });
				}
			}
			this.setState(
				(st) => ({
					loading: false,
					jokes: [ ...st.jokes, ...jokes ]
				}),
				() => window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
			);
			window.localStorage.setItem('jokes', JSON.stringify(jokes));
		} catch (e) {
			alert(e);
			this.setState({ loading: false });
		}
	}

	handleVote(id, delta) {
		this.setState(
			(st) => ({
				jokes: st.jokes.map((j) => (j.id === id ? { ...j, votes: j.votes + delta } : j))
			}),
			() => window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
		);
	}
	handleClick() {
		this.setState({ loading: true }, this.getJokes);
	}
	render() {
		if (this.state.loading) {
			return (
				<div className="jokeList-spinner">
					<i className="far fa-8x fa-laugh fa-spin" />
					<h1 className="jokeList-title">Loading...</h1>
				</div>
			);
		}
		return (
			<div className="jokeList">
				<div className="jokeList-sideBar">
					<h1 className="jokeList-title">Jokes</h1>
					<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Emojione_1F602.svg/1200px-Emojione_1F602.svg.png" />
					<button className="jokeList-btn" onClick={this.handleClick}>
						Load Jokes
					</button>
				</div>
				<div className="jokeList-jokes">
					{this.state.jokes.map((j) => (
						<Joke
							key={j.id}
							votes={j.votes}
							text={j.joke}
							upVote={() => {
								this.handleVote(j.id, 1);
							}}
							downVote={() => {
								this.handleVote(j.id, -1);
							}}
						/>
					))}
				</div>
			</div>
		);
	}
}
export default JokeList;
