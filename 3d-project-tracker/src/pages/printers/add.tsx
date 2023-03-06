import { Printer } from '@/models/printer'
import axios from 'axios'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function AddPage () {
  var [name, setName] = useState('')
  var [link, setLink] = useState('')
  const router = useRouter()

  const onSave = async () => {
    console.log('called!')
    var newPrinter: Printer = {
      name,
      link
    }
    try {
      var resp = await axios.post('/api/printers', newPrinter)
      console.log(resp)
      if (resp.status == 200) router.push('/printers')
      else alert(resp.data)
    } catch (error: any) {
      alert('An error occured, could not save!')
      console.log(error) // this is the main part. Use the response property from the error object
    }
  }

  return (
    <main>
      <div className='ui container'>
        <h1 className='ui inverted header'>Add Printer</h1>
        <div className='ui inverted segment'>
          <p>Printer Name</p>
          <div className='ui inverted input'>
            <input
              type='text'
              placeholder='Creality Ender 3 V2'
              value={name}
              onChange={x => setName(x.target.value)}
            />
          </div>
          <div className='ui divider'></div>
          <p>Link</p>
          <div className='ui inverted input'>
            <input
              type='text'
              placeholder='192.164...'
              value={link}
              onChange={x => setLink(x.target.value)}
            />
          </div>
          <div className='ui divider'></div>
          <button
            className='ui inverted green button'
            onClick={async () => onSave()}
          >
            Save
          </button>
          <Link href='/printers'>
            <button className='ui inverted red button'>Cancel</button>
          </Link>
        </div>
      </div>
    </main>
  )
}
