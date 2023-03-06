import Link from 'next/link'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Printer } from '@/models/printer'
import { useRouter } from 'next/router'

export default function Home () {
  var [printers, setPrinters] = useState([])
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get('/api/printers')
      console.log(data)
      setPrinters(data)
    }

    fetchData().catch(console.error)
  }, [])

  const onDelete = (printer: Printer) => {
    const confirmation = confirm(
      `Are you sure you want to delete ${printer.name}?`
    )
    if (confirmation) {
      axios
        .delete(`/api/printers/${printer._id}`)
        .then(() => router.reload())
        .catch((error: any) => {
          alert('Failed to delete!')
          console.log(error)
        })
    }
  }

  return (
    <main>
      <div className='ui container'>
        <h1 className='ui inverted header'>3D Printers</h1>
        <div className='ui inverted segment'>
          <Link href='/'>
            <button className='ui inverted violet button'>
              Manage Projects
            </button>
          </Link>
          <Link href='/printers/add'>
            <button className='ui inverted violet button'>Add Printer</button>
          </Link>
          <div className='ui divider'></div>

          <div className='ui inverted relaxed divided list'>
            {printers.map((p: Printer) => (
              <div className='item' key={p.name}>
                <div className='content'>
                  <div className='ui grid'>
                    <h2 className='left floated left aligned six wide column'>
                      {p.name}
                    </h2>
                    <div className='right floated right aligned six wide column'>
                      {p.link && (
                        <a target="_blank" href={p.link} rel="noopener noreferrer">
                          <button className='ui inverted green button'>
                            Link
                          </button>
                        </a>
                      )}
                      <Link href={`/printers/${p._id}`}>
                        <button className='ui inverted violet button'>
                          Edit
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
    </main>
  )
}
