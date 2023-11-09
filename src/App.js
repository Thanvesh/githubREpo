// App.js
import {useState, useEffect} from 'react'
import {BrowserRouter, Route, Link} from 'react-router-dom'

import './App.css'

const API_URL = 'https://api.github.com/search/repositories'

const RepoList = () => {
  const [repos, setRepos] = useState([])
  const [page, setPage] = useState(1)

  const getOneMonthAgo = () => {
    const today = new Date()
    const oneMonthAgo = new Date(today)
    oneMonthAgo.setMonth(today.getMonth() - 1)
    return oneMonthAgo.toISOString().split('T')[0]
  }

  const formatLastPushed = pushedAt => {
    const lastPushed = new Date(pushedAt)
    const now = new Date()
    const diffInSeconds = Math.floor((now - lastPushed) / 1000)

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`
    }
    if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`
    }
    if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`
    }
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch(
          `${API_URL}?q=created:>${getOneMonthAgo()}&sort=stars&page=${page}`,
          {
            headers: {
              Authorization: `Bearer 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`,
            },
          },
        )

        if (!response.ok) {
          console.error(
            'Failed to fetch repos:',
            response.status,
            response.statusText,
          )
          return
        }

        const data = await response.json()

        // Check if data.items is defined and iterable
        if (data.items && Symbol.iterator in Object(data.items)) {
          setRepos(prevRepos => [...prevRepos, ...data.items])
        } else {
          console.error('Data items is not iterable or undefined:', data.items)
        }
      } catch (error) {
        console.error('Error fetching repos:', error)
      }
    }

    fetchRepos()
  }, [page])

  const handleScroll = () => {
    const {scrollTop, clientHeight, scrollHeight} = document.documentElement

    if (scrollTop + clientHeight >= scrollHeight - 10) {
      // Load more when user is near the bottom
      setPage(prevPage => prevPage + 1)
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="container">
      <h1 className="heading">Most Starred Repos</h1>
      <ul>
        {repos.map(repo => (
          <li key={repo.id} className="repo-item">
            <Link to={`/repo/${repo.owner.login}/${repo.name}`}>
              <div className="card">
                <img
                  src={repo.owner.avatar_url}
                  alt={`${repo.owner.login}'s avatar`}
                  className="repo-avatar"
                />
                <div className="repo-details">
                  <h2 className="heading_repo">{repo.name}</h2>
                  <p className="repo-description">{repo.description}</p>
                  <div className="repo-div">
                    <div className="repo-stats">
                      <span className="repo-unit">
                        🌟 {repo.stargazers_count}
                      </span>
                      <span className="repo-unit">
                        🔧 {repo.open_issues_count}
                      </span>
                    </div>
                    <div className="last">
                      <p className="last-pushed">
                        Last pushed: {formatLastPushed(repo.pushed_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

const RepoDetails = ({match}) => {
  const {owner, repo} = match.params
  return (
    <div>
      <h2>Repo Details</h2>
      <p>Owner: {owner}</p>
      <p>Repo: {repo}</p>
    </div>
  )
}

const App = () => (
  <BrowserRouter>
    <Route exact path="/" component={RepoList} />
    <Route path="/repo/:owner/:repo" component={RepoDetails} />
  </BrowserRouter>
)

export default App
