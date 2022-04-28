import React, {useEffect, useMemo, useState} from 'react';
import { Menu, MenuProps, Typography, Upload, Table, message, UploadProps, Statistic, Card, Row, Col, Image } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';
import { column, tableData } from './tableData';

function App() {
  const [file, setFile] = useState<string>();
  const [filePath, setPath] = useState<string>();
  const [columns, setColumns] = useState<any[]>();
  const [data, setData] = useState<any>();
  const [imgs, setImgs] = useState<string[]>([]);
  const [imgSrc, setSrc] = useState<any[]>();
  const [visible, setVisible] = useState(true);

  const handleChange: UploadProps['onChange'] = (info) => {
    setColumns([]);
    setSrc([]);
    
    const {file} = info;
    if(file.status === 'done') {      
      message.success('上传成功')
      setPath(file.response.data)
      setFile(file.name)
      if(file.name.split('.')[1] === 'xml') {
        axios.get('/api/CKXml', {params: {path: file.response.data}}).then(r => {
          const imgs = r.data.data;
          setImgs(imgs);
        })
      }
    }
    
  }

  const menuOptions = useMemo(() => {
    const fileType = file?.split('.')[1];
    if(fileType === 'java') {
      return [
        {
          label: 'CK-JAVA Metric',
          key: 'CK-JAVA Metric',
        },
        {
          label: 'Tradition Metric',
          key: 'Tradition Metric',
        }
      ];
    } else if (fileType === 'xml') {
      return [{ label: 'CK-XML Metric', key: 'CK-XML Metric' }, { label: 'LK', key: 'LK' }];
    } else {
      return [];
    }
  }, [file])

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    onChange: handleChange,
    maxCount: 1,
  }

  const handleClickTitle: MenuProps['onClick'] = e => {
    if (e.key === 'Tradition Metric') {
      setVisible(true)
      axios.get('/api/TraJava', {params: {path: filePath}}).then(r => {
        const res = r.data.data;
        const keys = Object.keys(res);
        setColumns(keys); 
        setData(res);
      });
    } else if (e.key === 'CK-JAVA Metric') {
      setVisible(true)
      axios.get('/api/CKJava', {params: {path: filePath}}).then(r => {        
        const res = r.data.data[0];
        const keys = Object.keys(res);
        setColumns(keys); 
        setData(res);
      })
    } else if (e.key === 'CK-XML Metric') {
      setVisible(true)
      Promise.all(imgs.map((img) => axios.get('/api/getImage', {params: {path: img}, responseType: 'blob'}))).then(r => {
        let srcArr: any[] = []
        r.forEach((item) => {
          const reader = new FileReader();
          reader.readAsDataURL(item.data);
          reader.onload = () => {
            srcArr.push(reader.result)
            if(srcArr.length === 4) {
              setSrc(srcArr)
            }
          }
        })
      })
    } else {
      setVisible(false);
    }
  }

  return (
    <div className="App">
      <div style={{ display: 'flex', flexDirection: 'column'}}>
        <Upload.Dragger {...uploadProps} showUploadList={false} style={{ width: 600, margin: '60px auto' }}>
          <p className="ant-upload-drag-icon">
          <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
        </Upload.Dragger>
        <Typography.Title style={{ margin: '60px auto' }}>current file：{file || ""}</Typography.Title>
        <Menu 
          mode='horizontal' 
          items={menuOptions}
          onClick={handleClickTitle}
          style={{ width: '100%', marginBottom: 60 }}
        />
        <Card>
          {
            visible ? 
            <>
              <Row style={{ width: '100%' }}>
              {columns?.map((item) => {
                if(item === 'file') {
                  return undefined
                }
                return (
                  <Col span={8}>
                    <Card>
                      <Statistic title={item} value={data[item]} />
                    </Card>
                  </Col>  
                )
              })}
              </Row>
              <Row>
                {
                  imgSrc?.map(item => <Image src={item} />)
                }
              </Row>
            </> : 
            <Row>
              <Col span={24}><Table columns={column} pagination={false} dataSource={tableData} /></Col>    
            </Row>
          }
        </Card>
      </div>
    </div>
  );
}

export default App;
