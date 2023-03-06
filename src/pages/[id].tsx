import { Printer } from '@/models/printer'
import { Project } from '@/models/project'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import _ from 'lodash'
import Link from 'next/link'

var SAVE_TIMEOUT = 3000

let pageTimeout: any = null

export default function ProjectPage () {
  const [project, setProject] = useState<Project | null>(null)
  const [printers, setPrinters] = useState([])
  const router = useRouter()
  const { id } = router.query
  useEffect(() => {
    if (id == null) return
    const getData = async () => {
      const { data } = await axios.get(`/api/projects/${id}`)
      const { data: printers } = await axios.get(`/api/printers`)
      if (data == null) {
        alert('Invalid ID!')
        router.push('/')
      } else {
        console.log(data)
        setProject(data)
        setPrinters(printers)
      }
    }
    getData()
  }, [id])

  if (project == null)
    return (
      <div className='ui container'>
        <div className='ui segment'>
          <p></p>
          <div className='ui active dimmer'>
            <div className='ui loader'></div>
          </div>
        </div>
      </div>
    )

  const updateProj = (proj: any) => {
    if (pageTimeout) clearTimeout(pageTimeout)
    pageTimeout = setTimeout(async () => {
      console.log('initiating save', proj)
      await axios.post(`api/projects/${id}`, proj)
    }, SAVE_TIMEOUT)
    setProject(proj)
  }

  const onNameUpdate = (name: string) => {
    const cProj = _.clone(project)
    cProj.name = name
    updateProj(cProj)
  }

  const onCompleteToggle = () => {
    const cProj = _.clone(project)
    cProj.completed = !cProj.completed
    updateProj(cProj)
  }

  const onNotesUpdate = (notes: string) => {
    const cProj = _.clone(project)
    cProj.notes = notes
    updateProj(cProj)
  }

  const onPartUpdate = (
    index: number,
    element: string,
    value: string | number
  ) => {
    const cProj = _.clone(project)
    if (element == 'delete') {
      cProj.parts.splice(index, 1)
    } else {
      const part: any = cProj.parts[index]
      part[element] = value
      cProj.parts[index] = part
    }
    updateProj(cProj)
  }

  const addPart: any = () => {
    const cProj = _.clone(project)
    cProj.parts.push({
      name: '',
      number: 1,
      printer: '',
      color: '',
      material: '',
      weight: 0,
      time: 0,
      status: 'Not Started',
      printed: 0
    })
    updateProj(cProj)
  }

  return (
    <div className='ui container'>
      <div className='ui inverted segment'>
        <div className='ui inverted segment'>
          <div className='ui right aligned grid'>
            <div className='left floated left aligned eight wide column'>
              <h1 className='ui inverted header'>{project.name}</h1>
            </div>
            <div className='right floated right aligned eight wide column'>
              <button
                className={`ui ${project.completed ? 'green' : 'violet'} button`}
                style={{ width: 200 }}
                onClick={onCompleteToggle}
              >
                {project.completed ? 'Completed!' : 'In Progress'}
              </button>
            </div>
          </div>
        </div>
        <div className='ui divider' />
        <table className='ui selectable inverted table'>
          <thead>
            <tr>
              <th>Name</th>
              <th>#</th>
              <th>Printer</th>
              <th>Color</th>
              <th>Material</th>
              <th>Weight</th>
              <th>Time</th>
              <th>Status</th>
              <th>Printed</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {project.parts.map((p: any, i: number) => {
              return (
                <PartComponent
                  key={i}
                  part={p}
                  printers={printers}
                  index={i}
                  onUpdate={onPartUpdate}
                />
              )
            })}
          </tbody>
        </table>

        <div className='ui inverted segment'>
          <div className='ui right aligned grid'>
            <div className='right floated right aligned sixteen wide column'>
              <div className='ui input'>
                <button
                  className='ui inverted icon green button'
                  onClick={addPart}
                >
                  <i className='add icon'></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='ui divider' />
        <div className='ui aligned grid'>
          <div className='left floated left aligned six wide column'>
            <div className='ui input'>
              <div className='ui form'>
                <label>Name</label>
                <input
                  type='text'
                  placeholder='Name'
                  value={project.name}
                  onChange={(e: any) => {
                    onNameUpdate(e.target.value)
                  }}
                  style={{ marginBottom: 15 }}
                />
                <div className='field'>
                  <label>Notes</label>
                  <textarea
                    defaultValue={project.notes}
                    onChange={(e: any) => {
                      onNotesUpdate(e.target.value)
                    }}
                  ></textarea>
                </div>
                <div className='field'>
                  <Link href='/'>
                    <button className='ui inverted violet button'>
                      Return to Projects
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className='right floated right aligned six wide column'>
            <ResultsComponent project={project} />
          </div>
        </div>
      </div>
    </div>
  )
}

const ResultsComponent = ({ project }: any) => {
  const colors: any = {}
  const materials: any = {}
  const printers: any = {}
  for (const p of project.parts) {
    if (!(p.color in colors)) colors[p.color] = { weight: 0, time: 0 }
    colors[p.color].weight += p.weight
    colors[p.color].time += p.time

    if (!(p.material in materials))
      materials[p.material] = { weight: 0, time: 0 }
    materials[p.material].weight += p.weight
    materials[p.material].time += p.time

    if (!(p.printer in printers)) printers[p.printer] = { weight: 0, time: 0 }
    printers[p.printer].weight += p.weight
    printers[p.printer].time += p.time
  }

  let weight = 0
  let time = 0
  for (const p of project.parts) {
    weight += p.weight
    time += p.time
  }

  return (
    <div>
      <h3>Results</h3>

      <div className='ui divider' />
      <h4>Per Color</h4>
      <table className='ui inverted celled table'>
        <thead>
          <tr>
            <th>Color</th>
            <th>Weight</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(colors).map((c: any) => (
            <tr key={c}>
              <td>{c}</td>
              <td>{colors[c].weight}g</td>
              <td>{timeConverter(colors[c].time)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className='ui divider' />
      <h4>Per Material</h4>
      <table className='ui inverted celled table'>
        <thead>
          <tr>
            <th>Color</th>
            <th>Weight</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(materials).map((c: any) => (
            <tr key={c}>
              <td>{c}</td>
              <td>{materials[c].weight}g</td>
              <td>{timeConverter(materials[c].time)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className='ui divider' />
      <h4>Per Printer</h4>
      <table className='ui inverted celled table'>
        <thead>
          <tr>
            <th>Color</th>
            <th>Weight</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(printers).map((c: any) => (
            <tr key={c}>
              <td>{c}</td>
              <td>{printers[c].weight}g</td>
              <td>{timeConverter(printers[c].time)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className='ui divider' />
      <h4>Total Weight: {weight}g</h4>
      <h4 style={{ marginTop: 0 }}>Total Time: {timeConverter(time)}</h4>
    </div>
  )
}

const timeConverter = (time: number) =>
  `${Math.floor(time / 60)}:${n(time % 60)}`
function n (n: number) {
  return n > 9 ? '' + n : '0' + n
}

const PartComponent = ({ part, onUpdate, index, printers }: any) => {
  const styles: any = {}
  if (part?.status === 'Completed') styles['backgroundColor'] = 'green'
  return (
    <tr style={styles}>
      <td>
        <div className='ui input'>
          <input
            type='text'
            placeholder='Part Name'
            value={part?.name}
            onChange={e => onUpdate(index, 'name', e.target.value)}
          />
        </div>
      </td>
      <td>
        <div className='ui input shorter-input'>
          <input
            type='number'
            placeholder=''
            min={1}
            value={part?.number}
            onChange={e => onUpdate(index, 'number', parseInt(e.target.value))}
          />
        </div>
      </td>
      <td>
        <div className='ui compact menu'>
          <div className='ui simple dropdown item input-standard'>
            <div className='dropdown-text'>{part?.printer}</div>
            <div className='menu'>
              {printers.map((p: Printer) => (
                <div
                  className='item'
                  key={p.name}
                  onClick={() => {
                    onUpdate(index, 'printer', p.name)
                  }}
                >
                  {p.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </td>
      <td>
        <div className='ui input short-input'>
          <input
            type='text'
            placeholder=''
            value={part?.color}
            onChange={e => onUpdate(index, 'color', e.target.value)}
          />
        </div>
      </td>
      <td>
        <div className='ui input shorter-input'>
          <input
            type='text'
            placeholder=''
            min={0}
            value={part?.material}
            onChange={e => onUpdate(index, 'material', e.target.value)}
          />
        </div>
      </td>
      <td>
        <div className='ui input shorter-input'>
          <input
            type='number'
            min={0}
            value={part?.weight}
            onChange={e => onUpdate(index, 'weight', parseInt(e.target.value))}
          />
        </div>
      </td>
      <td>
        <div className='ui input short-input'>
          <input
            type='number'
            min={0}
            value={part?.time}
            onChange={e => onUpdate(index, 'time', parseInt(e.target.value))}
          />
        </div>
      </td>
      <td>
        <div className='ui compact menu'>
          <div className='ui simple dropdown item  input-standard'>
            <div className='dropdown-text'>{part?.status ?? 'Not Started'}</div>
            <div className='menu'>
              <div
                className='item'
                onClick={() => onUpdate(index, 'status', 'Not Started')}
              >
                Not Started
              </div>
              <div
                className='item'
                onClick={() => onUpdate(index, 'status', 'Printing')}
              >
                Printing
              </div>
              <div
                className='item'
                onClick={() => onUpdate(index, 'status', 'Completed')}
              >
                Completed
              </div>
            </div>
          </div>
        </div>
      </td>
      <td>
        <div className='ui input shorter-input'>
          <input
            type='number'
            value={part?.printed}
            onChange={e => onUpdate(index, 'printed', parseInt(e.target.value))}
          />
        </div>
      </td>
      <td>
        <button
          className='ui icon red inverted button'
          onClick={() => onUpdate(index, 'delete')}
        >
          <i className='delete icon'></i>
        </button>
      </td>
    </tr>
  )
}
