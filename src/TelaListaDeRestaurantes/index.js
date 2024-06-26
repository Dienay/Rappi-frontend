import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import useProtectedRoute from '../Hooks/useProtectedRoute';

import Loading from '../Components/Loading/index';
import CarrinhoContext from '../Contexts/CarrinhoContext';

import {
  Container,
  Overlay,
  Header,
  HeaderTitulo,
  HeaderIcone,
  ListaRestaurantes,
  ListaCategoria,
  CardRestaurante,
  CardImagemRestaurante,
  CardProduto,
  CardImagem,
  CardTexto,
  CardNome,
  CardDescription,
  CardPrice,
  CardInfo,
  CardTextoDelivery,
  BtnQuantidade,
  BtnAlteraQuantidade,
  BtnRemoveQuantidade,
  BoxQuantidade,
  BoxTexto,
  BoxSelect,
  BoxBtn,
} from './styles';

import iconeVoltar from '../Images/back.svg';

function TelaListaDeRestaurantes() {
  const navigate = useNavigate();
  const pathParams = useParams();
  const token = useProtectedRoute();

  const baseUrl =
    'https://us-central1-missao-newton.cloudfunctions.net/rappi4A/restaurants';

  const axiosConfig = useMemo(
    () => ({
      headers: {
        auth: token,
      },
    }),
    [token],
  );

  const [detalhesRestaurante, setDetalhesRestaurante] = useState();
  const [produtos, setProdutos] = useState();
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(0);
  const [boxQuantidade, setBoxQuantidade] = useState(false);

  const carrinhoContext = useContext(CarrinhoContext);

  const getRestaurantes = useCallback(async () => {
    const id = pathParams.id;

    try {
      const response = await axios.get(`${baseUrl}/${id}`, axiosConfig);
      setDetalhesRestaurante(response.data.restaurant);
      setProdutos(response.data.restaurant.products);
    } catch (err) {
      console.log(err);
    }
  }, [axiosConfig, pathParams.id]);

  useEffect(() => {
    getRestaurantes();
  }, [getRestaurantes]);

  let categorias = [];
  if (produtos) {
    const pegaCategorias = produtos.map((produto) => produto.category);

    categorias = pegaCategorias.filter((categoria, idx) => {
      return pegaCategorias.indexOf(categoria) === idx;
    });
  }

  const abrirBoxQuantidade = (id) => {
    const indexId = produtos.findIndex((produto) => {
      return produto.id === id;
    });

    const produto = produtos[indexId];

    setBoxQuantidade(produto);
  };

  const adicionaQuantidadeProduto = (
    produto,
    quantidadeSelecionada,
    restauranteId,
    restauranteName,
  ) => {
    if (quantidadeSelecionada > 0) {
      carrinhoContext.dispatch({
        type: 'ADICIONA_PRODUTO_CARRINHO',
        produto: produto,
        quantidadeSelecionada: quantidadeSelecionada,
        restauranteId: restauranteId,
      });
    }

    setBoxQuantidade(false);
    setQuantidadeSelecionada(0);
  };
  const contolaQuantidadeProduto = (e) => {
    setQuantidadeSelecionada(e.target.value);
  };

  const removerProduto = (produtoId) => {
    carrinhoContext.dispatch({
      type: 'REMOVE_PRODUTO_CARRINHO',
      produtoId: produtoId,
    });
  };

  const optionQuantidade = () => {
    let quantidades = [];
    for (let i = 0; i < 11; i++) {
      quantidades.push(i);
    }
    return (
      <>
        {quantidades.map((numero) => {
          return (
            <option key={numero} value={numero}>
              {numero}
            </option>
          );
        })}
      </>
    );
  };

  const clicaVoltar = () => {
    navigate(`/home`);
  };

  return (
    <>
      {!detalhesRestaurante || detalhesRestaurante === '' ? (
        <Loading />
      ) : (
        <Container>
          <Overlay aparece={boxQuantidade}></Overlay>
          <Header>
            <HeaderIcone
              src={iconeVoltar}
              onClick={clicaVoltar}
              alt="Ícone de voltar para a tela anterior"
            />
            <HeaderTitulo>Restaurante</HeaderTitulo>
          </Header>

          {detalhesRestaurante && (
            <CardRestaurante>
              <CardImagemRestaurante
                src={detalhesRestaurante.logoUrl}
                alt={detalhesRestaurante.name}
              />
              <CardNome>{detalhesRestaurante.name}</CardNome>
              <CardInfo CardInfo>{detalhesRestaurante.category}</CardInfo>
              <CardTextoDelivery>
                <CardInfo>{detalhesRestaurante.deliveryTime} min</CardInfo>
                <CardInfo>Frete R${detalhesRestaurante.shipping},00</CardInfo>
              </CardTextoDelivery>
              <CardInfo>{detalhesRestaurante.address}</CardInfo>
            </CardRestaurante>
          )}

          {detalhesRestaurante &&
            produtos &&
            categorias.map((categoria) => {
              return (
                <ListaRestaurantes key={categoria}>
                  <ListaCategoria>{categoria}</ListaCategoria>
                  {produtos.map((produto) => {
                    if (categoria === produto.category) {
                      return (
                        <CardProduto key={produto.id}>
                          <CardImagem
                            src={produto.photoUrl}
                            alt={produto.name}
                          />
                          <CardTexto>
                            <CardNome>{produto.name}</CardNome>
                            <CardDescription>
                              {produto.description}
                            </CardDescription>
                            <CardPrice>
                              R${produto.price.toFixed(2).replace('.', ',')}
                            </CardPrice>
                          </CardTexto>

                          {carrinhoContext.carrinho.map((produtoCarrinho) => {
                            if (produto.id === produtoCarrinho.id) {
                              return (
                                <BtnQuantidade key={produtoCarrinho.id}>
                                  {produtoCarrinho.quantity}
                                </BtnQuantidade>
                              );
                            }
                            return null;
                          })}

                          {carrinhoContext.carrinho.findIndex(
                            (produtoCarrinho) =>
                              produto.id === produtoCarrinho.id,
                          ) !== -1 ? (
                            <BtnRemoveQuantidade
                              onClick={() => removerProduto(produto.id)}
                            >
                              remover
                            </BtnRemoveQuantidade>
                          ) : (
                            <BtnAlteraQuantidade
                              onClick={() => abrirBoxQuantidade(produto.id)}
                            >
                              adicionar
                            </BtnAlteraQuantidade>
                          )}

                          {boxQuantidade.id === produto.id && (
                            <BoxQuantidade>
                              <BoxTexto>
                                Selecione a quantidade desejada
                              </BoxTexto>
                              <BoxSelect
                                onChange={contolaQuantidadeProduto}
                                value={quantidadeSelecionada}
                              >
                                {optionQuantidade()}
                              </BoxSelect>
                              <BoxBtn
                                onClick={() =>
                                  adicionaQuantidadeProduto(
                                    produto,
                                    quantidadeSelecionada,
                                    detalhesRestaurante.id,
                                    detalhesRestaurante.name,
                                  )
                                }
                              >
                                Adicionar ao carrinho
                              </BoxBtn>
                            </BoxQuantidade>
                          )}
                        </CardProduto>
                      );
                    }
                    return null;
                  })}
                </ListaRestaurantes>
              );
            })}
        </Container>
      )}
    </>
  );
}

export default TelaListaDeRestaurantes;
