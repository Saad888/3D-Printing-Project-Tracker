import { Project } from '@/models/project'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function Home () {
  const [name, setName] = useState('')
  const [projects, setProjects] = useState([])
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data } = await axios.get('/api/projects')
      console.log(data)
      setProjects(data)
    }

    getData()
  }, [])

  const onDelete = (project: Project) => {
    const confirmation = confirm(
      `Are you sure you want to delete ${project.name}?`
    )
    if (confirmation) {
      axios
        .delete(`/api/projects/${project._id}`)
        .then(() => router.reload())
        .catch((error: any) => {
          alert('Failed to delete!')
          console.log(error)
        })
    }
  }

  const onCreateProject = async () => {
    const newProject: Project = {
      name,
      notes: '',
      parts: [],
      completed: false
    }
    axios
      .post('/api/projects', newProject)
      .then(result => {
        console.log(result)
        router.push(`/${result.data}`)
      })
      .catch((error: any) => {
        console.log(error)
        alert('Error occured when trying to create a project')
      })
  }

  const completed: any = projects.filter((p: Project) => p.completed === true)
  const incomplete: any = projects.filter((p: Project) => p.completed !== true)

  return (
    <div className='ui container'>
      <h1 className='ui inverted header'>3D Project Tracker</h1>

      <div className='ui inverted segment'>
        <div className='ui right aligned grid'>
          <div className='left floated left aligned six wide column'>
            <Link href='/printers'>
              <button className='ui inverted violet button'>
                Manage Printers
              </button>
            </Link>
          </div>
          <div className='right floated right aligned six wide column'>
            <div className='ui action input'>
              <input
                type='text'
                placeholder='Name...'
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <button
                className='ui inverted green button'
                onClick={onCreateProject}
              >
                Add Project
              </button>
            </div>
          </div>
        </div>

        <div className='ui divider'></div>
        <h2>In Progress</h2>
        <div className='ui inverted relaxed divided list'>
          {incomplete.map((p: Project) => (
            <div className='item' key={p._id}>
              <div className='content'>
                <div className='ui grid'>
                  <h3 className='left floated left aligned six wide column'>
                    {p.name}
                  </h3>
                  <div className='right floated right aligned six wide column'>
                    <Link href={`/${p._id}`}>
                      <button className='ui inverted violet button'>
                        Open
                      </button>
                    </Link>
                    <button
                      className='ui inverted red button'
                      onClick={() => onDelete(p)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className='ui divider' style={{marginBottom: 150}}></div>
        
        <h2>Completed Projects</h2>
        <div className='ui divider'></div>
        <div className='ui inverted relaxed divided list'>
          {completed.map((p: Project) => (
            <div className='item' key={p._id}>
              <div className='content'>
                <div className='ui grid'>
                  <h3 className='left floated left aligned six wide column'>
                    {p.name}
                  </h3>
                  <div className='right floated right aligned six wide column'>
                    <Link href={`/${p._id}`}>
                      <button className='ui inverted violet button'>
                        Open
                      </button>
                    </Link>
                    <button
                      className='ui inverted red button'
                      onClick={() => onDelete(p)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
