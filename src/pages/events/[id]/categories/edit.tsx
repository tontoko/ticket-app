import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import {
  Form,
  FormGroup,
  Button,
  Input,
  Row,
  Col,
  Label,
  Spinner,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons'
import { useAlert } from 'react-alert'
import { encodeQuery } from '@/src/lib/parseQuery'
import withAuth from '@/src/lib/withAuth'
import { fuego, useCollection, revalidateCollection } from '@nandorojo/swr-firestore'
import { Category } from 'app'
import Loading from '@/src/components/loading'
import analytics from '@/src/lib/analytics'

const Edit = ({ user, setModal, setModalInner }) => {
  const alert = useAlert()
  const router = useRouter()
  const { data: categories, loading } = useCollection<Category>(
    `events/${router.query.id}/categories`,
    {
      orderBy: 'index',
    },
  )

  const [currentCategories, setCategories] = useState<
    (Pick<Category, 'name' | 'price' | 'public' | 'stock'> & { new?: boolean; sold?: number })[]
  >([])

  useEffect(() => {
    if (loading) return
    setCategories(categories)
  }, [categories, loading])

  const renderCategories = () =>
    currentCategories &&
    currentCategories.map((category: firebase.default.firestore.DocumentData, i) => {
      const setName = (name: string) => {
        const copyCategories = [...currentCategories]
        copyCategories[i] = { ...copyCategories[i], name }
        setCategories(copyCategories)
      }
      const setPrice = (price: number) => {
        if (price < 0) return
        const copyCategories = [...currentCategories]
        copyCategories[i] = { ...copyCategories[i], price }
        setCategories(copyCategories)
      }
      const setStock = (stock: number) => {
        if (stock < 0) return
        const copyCategories = [...currentCategories]
        copyCategories[i] = { ...copyCategories[i], stock }
        setCategories(copyCategories)
      }
      const setPublic = (value: boolean) => {
        const copyCategories = [...currentCategories]
        copyCategories[i] = { ...copyCategories[i], public: value }
        setCategories(copyCategories)
      }
      const deleteCategory = () => {
        const copyCategories = [...currentCategories]
        copyCategories.splice(i, 1)
        setCategories(copyCategories)
      }
      const moveArrayElementToPrev = () => {
        const copyCategory = [...currentCategories]
        const reversedCategories = [copyCategory[i], copyCategory[i - 1]]
        const beginCategories = i - 1 > 0 ? copyCategory.slice(0, i - 1) : []
        const endCategories = i < currentCategories.length - 1 ? copyCategory.slice(i + 1) : []
        setCategories([...beginCategories, ...reversedCategories, ...endCategories])
      }
      const moveArrayElementToNext = () => {
        const copyCategory = [...currentCategories]
        const reversedCategories = [copyCategory[i + 1], copyCategory[i]]
        const beginCategories = i !== 0 ? copyCategory.slice(0, i) : []
        const endCategories = i < currentCategories.length - 2 ? copyCategory.slice(i + 2) : []
        setCategories([...beginCategories, ...reversedCategories, ...endCategories])
      }
      return (
        <FormGroup
          key={i}
          style={{ border: 'solid 1px gray', borderRadius: '8px', padding: '0.8em' }}
        >
          <Row form>
            <div style={{ width: '1em' }}>
              <Row form style={{ height: '50%', position: 'relative' }}>
                {i !== 0 && (
                  <FontAwesomeIcon
                    icon={faSortUp}
                    style={{
                      color: 'gray',
                      margin: 0,
                      height: '60%',
                      cursor: 'pointer',
                      position: 'absolute',
                      top: '0.1em',
                      left: '0.25em',
                    }}
                    className="fa-2x"
                    onClick={moveArrayElementToPrev}
                  />
                )}
              </Row>
              <Row form style={{ height: '50%', position: 'relative' }}>
                {i !== currentCategories.length - 1 && (
                  <FontAwesomeIcon
                    icon={faSortDown}
                    style={{
                      color: 'gray',
                      margin: 0,
                      height: '60%',
                      cursor: 'pointer',
                      position: 'absolute',
                      bottom: '0.1em',
                      left: '0.25em',
                    }}
                    className="fa-2x"
                    onClick={moveArrayElementToNext}
                  />
                )}
              </Row>
            </div>
            <Col>
              <Row style={{ margin: 0, marginTop: '0.5em' }}>
                <Col xs="11">
                  <Input
                    value={category.name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!category.new}
                    placeholder="チケットカテゴリ名"
                  />
                </Col>
                <Col xs="1" style={{ padding: 0, display: 'flex', alignItems: 'center' }}>
                  {category.new && (
                    <FontAwesomeIcon
                      icon={faTimesCircle}
                      style={{ color: 'gray', margin: 0, height: '60%', cursor: 'pointer' }}
                      className="fa-2x"
                      onClick={deleteCategory}
                    />
                  )}
                </Col>
              </Row>
              <Row style={{ margin: 0, marginTop: '0.5em' }}>
                <Col sm="12" md="4" lg="3" style={{ display: 'flex', marginTop: '0.5em' }}>
                  <Input
                    type="number"
                    min="0"
                    value={category.price}
                    onChange={(e) => setPrice(parseInt(e.target.value, 10))}
                    style={{ textAlign: 'right' }}
                    disabled={!category.new}
                  />
                  <p style={{ margin: 'auto 0', marginLeft: '0.5em' }}> 円</p>
                </Col>
                <Col sm="12" md="4" lg="3" style={{ display: 'flex', marginTop: '0.5em' }}>
                  <Input
                    type="number"
                    min="0"
                    value={category.stock}
                    onChange={(e) => setStock(parseInt(e.target.value ? e.target.value : '0', 10))}
                    style={{ textAlign: 'right' }}
                  />
                  <p style={{ margin: 'auto 0', marginLeft: '0.5em' }}> 枚</p>
                </Col>
                {!category.new && (
                  <Col sm="12" md="4" lg="3" style={{ display: 'flex', marginTop: '0.5em' }}>
                    <p style={{ margin: 'auto 0', marginLeft: '0.5em' }}>
                      売上 {category.sold} 枚<br />
                      残り在庫 {category.stock - category.sold
                        ? category.stock - category.sold
                        : 0}{' '}
                      枚
                    </p>
                  </Col>
                )}
                <Col style={{ display: 'flex', alignItems: 'center', marginTop: '0.5em' }}>
                  <Label for="public" style={{ margin: 0, fontWeight: 'bold' }}>
                    公開する
                  </Label>
                  <Input
                    type="checkbox"
                    name="public"
                    checked={category.public}
                    onChange={(e) => setPublic(e.target.checked)}
                    style={{ margin: 0, marginLeft: '0.3em', position: 'initial' }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </FormGroup>
      )
    })

  const addCategory = () => {
    const copyCategories = [...currentCategories]
    copyCategories.push({
      name: '',
      price: 500,
      public: false,
      stock: 1,
      new: true,
    })
    setCategories(copyCategories)
  }

  const submit = async (e) => {
    e.preventDefault()
    try {
      const names = []
      currentCategories.filter((category) => {
        if (!category.name) throw new Error('チケット名を入力してください。')
        if (category.price < 500) throw new Error('チケットの価格は500円以上に設定してください。')
        if (category.stock < 1 && category.new)
          throw new Error('チケットの在庫は1枚以上に設定してください。')
        if (!category.new && category.stock - category.sold < 0)
          throw new Error('チケットの在庫は売り上げ分を引いて0枚以上に設定してください。')
        if (names.indexOf(category['name']) === -1) {
          names.push(category['name'])
          return category
        }
        throw new Error('チケット名が重複しています')
      })
      setModalInner(
        <ModalInner
          currentCategories={currentCategories}
          user={user}
          alert={alert}
          setModal={setModal}
        />,
      )
      setModal(true)
    } catch (e) {
      ;(await analytics()).logEvent('exception', { description: e.message })
      alert.error(e.message)
    }
  }

  if (loading) <Loading />

  return (
    <Form style={{ marginTop: '5em' }} onSubmit={submit}>
      <h5 style={{ marginBottom: '1em' }}>カテゴリ一覧</h5>
      {renderCategories()}
      <Button onClick={addCategory}>カテゴリ追加</Button>
      <Row className="flex-row-reverse" style={{ marginTop: '2em' }}>
        <Button style={{ marginRight: '1em' }}>確認</Button>
      </Row>
    </Form>
  )
}

const ModalInner = ({ currentCategories, user, alert, setModal }) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const submit = async (e) => {
    e.preventDefault()
    if (loading) return
    try {
      setLoading(true)
      const categoriesRef = fuego.db
        .collection('events')
        .doc(router.query.id as string)
        .collection('categories')
      const names = []
      currentCategories.filter((e) => {
        if (!e.name) throw new Error('チケット名を入力してください。')
        if (e.price < 500) throw new Error('チケットの価格は500円以上に設定してください。')
        if (e.stock < 1 && e.new) throw new Error('チケットの在庫は1枚以上に設定してください。')
        if (names.indexOf(e['name']) === -1) {
          names.push(e['name'])
          return e
        }
        throw new Error('チケット名が重複しています')
      })
      const addCategories = []
      const updateCategories: { string?: firebase.default.firestore.DocumentData } = {}
      await Promise.all(
        currentCategories.map(async (category, i) => {
          if (category.new) {
            const addCategory = {
              ...category,
              price: Number(category.price),
              stock: Number(category.stock),
              sold: 0,
              createdUser: user.uid,
              index: i,
            }
            delete addCategory.new
            addCategories.push(addCategory)
          } else {
            const updateCategory = {
              stock: Number(category.stock),
              public: category.public,
              index: i,
            }
            updateCategories[category.id] = updateCategory
          }
        }),
      )
      // 既存カテゴリ編集
      await fuego.db.runTransaction(async (transaction) => {
        await Promise.all(
          Object.keys(updateCategories).map(async (id) => {
            const targetCategory = (await transaction.get(categoriesRef.doc(id))).data()
            if (((updateCategories[id].stock - targetCategory.sold) as number) < 0)
              throw new Error('チケットの在庫は売り上げ分を引いて0枚以上に設定してください。')
            transaction.update(categoriesRef.doc(id), updateCategories[id])
            return
          }),
        )
      })
      // 新規カテゴリ登録
      await Promise.all(addCategories.map(async (addCategory) => categoriesRef.add(addCategory)))
      await revalidateCollection(`events/${router.query.id}/categories`)
      setModal(false)
      router.push({
        pathname: `/events/${router.query.id}`,
        query: {
          msg: encodeQuery('更新しました。表示に反映されるまで時間がかかる場合があります。'),
        },
      })
    } catch (e) {
      ;(await analytics()).logEvent('exception', { description: e.message })
      alert.error(e.message)
      setLoading(false)
    }
  }

  return (
    <Form onSubmit={submit}>
      <ModalHeader>チケットカテゴリーを更新します。</ModalHeader>
      <ModalBody>
        <h5 style={{ marginBottom: '1em' }}>
          一度登録したチケット名と価格は変更することができません。 (非公開にすることはできます)
        </h5>
        {currentCategories.map((category, i) => (
          <FormGroup key={i}>
            <p>
              {`${category.name}: ${category.price} 円 (在庫: ${category.stock})${
                !category.public ? ' (非公開)' : ''
              }`}
            </p>
          </FormGroup>
        ))}
        <Row style={{ marginTop: '0.5em' }}></Row>
      </ModalBody>
      <ModalFooter>
        <Button type="button" style={{ marginRight: '0.5em' }} onClick={() => setModal(false)}>
          キャンセル
        </Button>
        <Button disabled={loading}>{loading ? <Spinner /> : '公開'}</Button>
      </ModalFooter>
    </Form>
  )
}

export default withAuth(Edit)
