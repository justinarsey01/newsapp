'use client';
import {useState} from 'react';import {sbBrowser} from '../../lib/auth';
export default function Unsub({email}){const [d,setD]=useState(false);
 return d?<p>You have been unsubscribed.</p>:<button className="p" onClick={async()=>{await sbBrowser().rpc('unsubscribe',{e:email});setD(true)}}>Unsubscribe {email}</button>}
