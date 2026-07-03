export const manifest = {
  "architecture": {
    "id": "diffusion_transformer",
    "name": "Diffusion Transformer (DiT)",
    "status": "draft",
    "sourceYaml": "../../architectures/diffusion-transformer.yaml",
    "modules": [
      {
        "id": "patchify",
        "label": "Patchify",
        "kind": "feature_adapter",
        "role": "embed p x p latent patches into tokens and add fixed 2D sin-cos positional embeddings",
        "scale": "token",
        "inputs": [
          "input_latent"
        ],
        "outputs": [
          "token_state"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3.2 (Patchify)"
            },
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiT.__init__ (x_embedder, pos_embed)",
              "note": "PatchEmbed plus non-learned sin-cos positional table."
            }
          ]
        }
      },
      {
        "id": "timestep_embedder",
        "label": "Timestep Embedder",
        "kind": "feature_adapter",
        "role": "encode the scalar timestep with a 256-dim sinusoidal embedding followed by a two-layer SiLU MLP",
        "scale": "sample",
        "contains": [
          {
            "id": "sinusoidal_embedding",
            "label": "Sinusoidal embedding + MLP",
            "standard_block_ref": "../../standard_blocks/sinusoidal-timestep-embedding.yaml"
          }
        ],
        "inputs": [
          "timestep"
        ],
        "outputs": [
          "t_embedding"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "TimestepEmbedder"
            }
          ]
        }
      },
      {
        "id": "label_embedder",
        "label": "Label Embedder",
        "kind": "feature_adapter",
        "role": "look up the class embedding; randomly drop labels to the null class during training for classifier-free guidance",
        "scale": "sample",
        "inputs": [
          "class_label"
        ],
        "outputs": [
          "y_embedding"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "LabelEmbedder"
            }
          ]
        }
      },
      {
        "id": "cond_combiner",
        "label": "Conditioning Combiner",
        "kind": "elementwise_sum",
        "role": "sum timestep and label embeddings into one per-sample conditioning vector",
        "scale": "sample",
        "inputs": [
          "t_embedding",
          "y_embedding"
        ],
        "outputs": [
          "cond_vector"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiT.forward",
              "note": "c = t + y."
            }
          ]
        }
      },
      {
        "id": "dit_blocks",
        "label": "DiT Block Stack",
        "kind": "attention_stack",
        "role": "update patch tokens with full self-attention and MLP branches, both modulated and gated by adaLN-Zero conditioning",
        "scale": "token",
        "repeats": 28,
        "pseudocode_ref": "../../pseudocode/diffusion-transformer.yaml",
        "depth": {
          "blocks": 28,
          "heads": 16
        },
        "contains": [
          {
            "id": "adaln_zero",
            "label": "adaLN-Zero",
            "standard_block_ref": "../../standard_blocks/adaln-zero-conditioning.yaml"
          }
        ],
        "inputs": [
          "token_state",
          "cond_vector"
        ],
        "outputs": [
          "token_state"
        ],
        "attention": {
          "pattern": "full",
          "query_scale": "token",
          "key_value_scale": "token",
          "heads": 16,
          "pair_bias": false,
          "pair_bias_source": "none",
          "positional_encoding": {
            "kind": "absolute_sincos_added_at_patchify"
          }
        },
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3.2 (DiT block design), Table 1",
              "note": "Depth 28 / 16 heads is the DiT-XL configuration; other sizes exist."
            }
          ]
        }
      },
      {
        "id": "final_layer",
        "label": "Final Layer",
        "kind": "decoder",
        "role": "apply adaLN-modulated LayerNorm, then linearly decode each token to a p x p x 2C patch prediction",
        "scale": "token",
        "inputs": [
          "token_state",
          "cond_vector"
        ],
        "outputs": [
          "output_tokens"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "FinalLayer"
            }
          ]
        }
      },
      {
        "id": "unpatchify",
        "label": "Unpatchify",
        "kind": "scale_transition",
        "role": "rearrange per-token patch predictions back to the spatial latent layout",
        "scale": "spatial",
        "inputs": [
          "output_tokens"
        ],
        "outputs": [
          "noise_prediction"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiT.unpatchify"
            }
          ]
        }
      }
    ],
    "representations": [
      {
        "id": "input_latent",
        "scale": "spatial",
        "semantic_role": "noised VAE latent at the current denoising step",
        "shape": "B x 4 x I x I (I = 32 for 256^2 images)",
        "carries": [
          "noised image content"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3 (Latent diffusion), Sec. 3.2"
            }
          ]
        }
      },
      {
        "id": "timestep",
        "scale": "sample",
        "semantic_role": "diffusion timestep index for the current step",
        "shape": "B",
        "carries": [
          "noise level"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3.2"
            }
          ]
        }
      },
      {
        "id": "class_label",
        "scale": "sample",
        "semantic_role": "class conditioning input (with a null class for classifier-free guidance)",
        "shape": "B",
        "carries": [
          "class identity"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "LabelEmbedder",
              "note": "Dropped labels are mapped to an extra embedding index num_classes."
            }
          ]
        }
      },
      {
        "id": "t_embedding",
        "scale": "sample",
        "semantic_role": "embedded timestep",
        "shape": "B x d",
        "carries": [
          "noise-level embedding"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "TimestepEmbedder"
            }
          ]
        }
      },
      {
        "id": "y_embedding",
        "scale": "sample",
        "semantic_role": "embedded class label",
        "shape": "B x d",
        "carries": [
          "class embedding"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "LabelEmbedder"
            }
          ]
        }
      },
      {
        "id": "cond_vector",
        "scale": "sample",
        "semantic_role": "combined conditioning vector shared by all tokens of a sample",
        "shape": "B x d",
        "carries": [
          "timestep and class conditioning"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiT.forward",
              "note": "c = t + y before the block stack."
            }
          ]
        }
      },
      {
        "id": "token_state",
        "scale": "token",
        "semantic_role": "mutable patch-token stream",
        "shape": "B x T x d, T = (I/p)^2",
        "carries": [
          "patch content",
          "fixed 2D sin-cos positional embedding"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3.2 (Patchify)"
            }
          ]
        }
      },
      {
        "id": "output_tokens",
        "scale": "token",
        "semantic_role": "decoded per-token patch predictions",
        "shape": "B x T x (p * p * 2C)",
        "carries": [
          "predicted noise patch",
          "predicted covariance patch"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "FinalLayer",
              "note": "Linear(hidden_size, patch_size * patch_size * out_channels)."
            }
          ]
        }
      },
      {
        "id": "noise_prediction",
        "scale": "spatial",
        "semantic_role": "predicted noise and covariance at latent resolution",
        "shape": "B x 2C x I x I, split into epsilon and Sigma",
        "carries": [
          "noise prediction",
          "covariance prediction"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3.2 (Transformer decoder)"
            }
          ]
        }
      }
    ],
    "execution": {
      "loops": [
        {
          "id": "denoising_loop",
          "repeats": "num_sampling_steps",
          "reruns": [
            "patchify",
            "timestep_embedder",
            "label_embedder",
            "cond_combiner",
            "dit_blocks",
            "final_layer",
            "unpatchify"
          ],
          "cached": [

          ],
          "notes": [
            "The full backbone reruns at every denoising step; only the timestep input changes across steps for a fixed sample.",
            "Classifier-free guidance runs a conditional and an unconditional pass per step, batched together in the reference sampler."
          ],
          "evidence": {
            "status": "confirmed_from_paper",
            "refs": [
              {
                "kind": "paper",
                "path": "arXiv:2212.09748",
                "lines": "Sec. 3.1, Sec. 4",
                "note": "DDPM sampling with classifier-free guidance; 250 sampling steps for reported results."
              }
            ]
          }
        }
      ]
    },
    "stateSemantics": {
      "token_state": {
        "role": "mutable_state",
        "produced_by": "patchify",
        "updated_by": [
          "dit_blocks"
        ],
        "consumed_by": [
          "final_layer"
        ],
        "notes": [
          "The token stream is the only mutable state inside one forward pass."
        ]
      },
      "cond_vector": {
        "role": "read_only_conditioning",
        "produced_by": "cond_combiner",
        "updated_by": [

        ],
        "consumed_by": [
          "dit_blocks",
          "final_layer"
        ],
        "notes": [
          "Per-sample vector; every token in a sample shares the same modulation parameters."
        ]
      }
    },
    "conditioning": [
      {
        "id": "block_adaln_zero",
        "source": "cond_vector",
        "target": "dit_blocks",
        "mode": "adaln_zero",
        "standard_block_ref": "standard_blocks/adaln-zero-conditioning.yaml",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiTBlock",
              "note": "adaLN_modulation(c).chunk(6) yields shift/scale/gate for attention and MLP branches; gate projection zero-initialized."
            }
          ]
        }
      },
      {
        "id": "final_layer_adaln",
        "source": "cond_vector",
        "target": "final_layer",
        "mode": "adaln",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "FinalLayer",
              "note": "adaLN_modulation(c).chunk(2) yields shift/scale before the linear decode; no gate in the final layer."
            }
          ]
        }
      }
    ],
    "scaleTransitions": [
      {
        "id": "patchify_tokens",
        "from_scale": "spatial",
        "to_scale": "token",
        "source": "input_latent",
        "target": "token_state",
        "projection": "patch_embedding",
        "aggregation": "flatten_patches",
        "copy_vs_pool": "pool",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3.2 (Patchify)",
              "note": "p x p patches are linearly embedded into T = (I/p)^2 tokens."
            }
          ]
        }
      },
      {
        "id": "unpatchify_output",
        "from_scale": "token",
        "to_scale": "spatial",
        "source": "output_tokens",
        "target": "noise_prediction",
        "projection": "none",
        "aggregation": "reshape",
        "copy_vs_pool": "copy",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3.2 (Transformer decoder)",
              "note": "Decoded tokens are rearranged back to the spatial latent layout; lossless reshape."
            }
          ]
        }
      }
    ],
    "trainingInference": {
      "objective": {
        "kind": "diffusion_noise_prediction",
        "notes": [
          "MSE on predicted noise epsilon; learned covariance Sigma trained with the full KL term, following ADM."
        ]
      },
      "schedule": {
        "kind": "linear_variance",
        "steps": 1000
      },
      "sampler": {
        "kind": "ddpm",
        "steps": 250,
        "guidance": "classifier_free"
      },
      "teacher_forcing": "not_applicable",
      "self_conditioning": "none",
      "checkpoint_notes": [
        "Operates in the latent space of a frozen, off-the-shelf VAE (8x spatial downsampling); the VAE is out of scope for this slice."
      ]
    },
    "edges": [
      {
        "from": "input_latent",
        "to": "patchify",
        "carries": [
          "noised latent"
        ],
        "operation": "patch_embedding",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3.2 (Patchify)"
            }
          ]
        }
      },
      {
        "from": "patchify",
        "to": "token_state",
        "carries": [
          "token_state"
        ],
        "operation": "initialize_tokens_with_positional_embedding",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiT.forward"
            }
          ]
        }
      },
      {
        "from": "timestep",
        "to": "timestep_embedder",
        "carries": [
          "timestep"
        ],
        "operation": "sinusoidal_embedding",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "TimestepEmbedder"
            }
          ]
        }
      },
      {
        "from": "timestep_embedder",
        "to": "t_embedding",
        "carries": [
          "t_embedding"
        ],
        "operation": "mlp_projection",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "TimestepEmbedder"
            }
          ]
        }
      },
      {
        "from": "class_label",
        "to": "label_embedder",
        "carries": [
          "class_label"
        ],
        "operation": "label_embedding_with_cfg_dropout",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "LabelEmbedder"
            }
          ]
        }
      },
      {
        "from": "label_embedder",
        "to": "y_embedding",
        "carries": [
          "y_embedding"
        ],
        "operation": "embedding_lookup",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "LabelEmbedder"
            }
          ]
        }
      },
      {
        "from": "t_embedding",
        "to": "cond_combiner",
        "carries": [
          "t_embedding"
        ],
        "operation": "sum",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiT.forward"
            }
          ]
        }
      },
      {
        "from": "y_embedding",
        "to": "cond_combiner",
        "carries": [
          "y_embedding"
        ],
        "operation": "sum",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiT.forward"
            }
          ]
        }
      },
      {
        "from": "cond_combiner",
        "to": "cond_vector",
        "carries": [
          "cond_vector"
        ],
        "operation": "initialize_conditioning",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiT.forward"
            }
          ]
        }
      },
      {
        "from": "token_state",
        "to": "dit_blocks",
        "carries": [
          "token_state"
        ],
        "operation": "self_attention_update",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3.2"
            }
          ]
        }
      },
      {
        "from": "cond_vector",
        "to": "dit_blocks",
        "carries": [
          "cond_vector"
        ],
        "operation": "adaln_zero_modulation",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiTBlock"
            }
          ]
        }
      },
      {
        "from": "dit_blocks",
        "to": "final_layer",
        "carries": [
          "token_state"
        ],
        "operation": "decode_tokens",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiT.forward"
            }
          ]
        }
      },
      {
        "from": "cond_vector",
        "to": "final_layer",
        "carries": [
          "cond_vector"
        ],
        "operation": "adaln_modulation",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "FinalLayer"
            }
          ]
        }
      },
      {
        "from": "final_layer",
        "to": "output_tokens",
        "carries": [
          "output_tokens"
        ],
        "operation": "linear_decode",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "FinalLayer"
            }
          ]
        }
      },
      {
        "from": "output_tokens",
        "to": "unpatchify",
        "carries": [
          "output_tokens"
        ],
        "operation": "reshape",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiT.unpatchify"
            }
          ]
        }
      },
      {
        "from": "unpatchify",
        "to": "noise_prediction",
        "carries": [
          "noise_prediction"
        ],
        "operation": "predict",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3.2 (Transformer decoder)"
            }
          ]
        }
      }
    ],
    "claims": [
      "adaLN-Zero conditioning outperformed in-context conditioning and cross-attention conditioning in the DiT block ablations.",
      "Zero-initializing the residual gate projections makes each DiT block the identity at initialization, which accelerated training.",
      "The conditioning vector is per-sample, not per-token; all tokens of a sample share the same modulation parameters, unlike per-item AdaLN."
    ]
  },
  "standardBlocks": {
    "adaln_zero_conditioning": {
      "id": "adaln_zero_conditioning",
      "name": "AdaLN-Zero Conditioning",
      "sourceYaml": "../../standard_blocks/adaln-zero-conditioning.yaml",
      "description": "Regress per-sample shift, scale, and residual-gate parameters from a global conditioning vector; the gate projection is zero-initialized so every residual branch starts as the identity.",
      "math": [
        {
          "id": "regress_modulation",
          "text": "shift1, scale1, gate1, shift2, scale2, gate2 = MLP(SiLU(c))",
          "tex": "\\beta_1, \\gamma_1, \\alpha_1, \\beta_2, \\gamma_2, \\alpha_2 = \\operatorname{MLP}(\\operatorname{SiLU}(c))",
          "operation": "conditioning_projection"
        },
        {
          "id": "modulate_attention_branch",
          "text": "h = x + gate1 * Attn(scale1 * LN(x) + shift1)",
          "tex": "h = x + \\alpha_1 \\odot \\operatorname{Attn}(\\gamma_1 \\odot \\operatorname{LN}(x) + \\beta_1)",
          "operation": "gated_residual_attention"
        },
        {
          "id": "modulate_mlp_branch",
          "text": "y = h + gate2 * MLP(scale2 * LN(h) + shift2)",
          "tex": "y = h + \\alpha_2 \\odot \\operatorname{MLP}(\\gamma_2 \\odot \\operatorname{LN}(h) + \\beta_2)",
          "operation": "gated_residual_mlp"
        },
        {
          "id": "identity_initialization",
          "text": "gate projection weights initialized to zero, so each block is the identity at initialization",
          "operation": "initialization_policy"
        }
      ]
    },
    "sinusoidal_timestep_embedding": {
      "id": "sinusoidal_timestep_embedding",
      "name": "Sinusoidal Timestep Embedding",
      "sourceYaml": "../../standard_blocks/sinusoidal-timestep-embedding.yaml",
      "description": "Expand a scalar diffusion timestep into a fixed sinusoidal frequency embedding, then project it to model width with a two-layer SiLU MLP. A reusable atom for diffusion-style architectures.",
      "math": [
        {
          "id": "frequencies",
          "text": "freqs = exp(-ln(10^4) * arange(128) / 128)",
          "tex": "\\omega_k = \\exp\\!\\left(-\\tfrac{k \\ln 10^4}{128}\\right),\\; k = 0..127",
          "operation": "frequency_table"
        },
        {
          "id": "sinusoid",
          "text": "emb = concat(cos(t * freqs), sin(t * freqs))  # 256-dim",
          "tex": "e = [\\cos(t\\,\\omega);\\; \\sin(t\\,\\omega)] \\in \\mathbb{R}^{256}",
          "operation": "sinusoidal_expansion"
        },
        {
          "id": "mlp_projection",
          "text": "t_emb = Linear_d(SiLU(Linear_d(emb)))",
          "tex": "t_{\\mathrm{emb}} = W_2\\,\\operatorname{SiLU}(W_1 e)",
          "operation": "mlp_projection"
        }
      ]
    },
    "per_item_adaln_conditioning": {
      "id": "per_item_adaln_conditioning",
      "name": "Per-Item AdaLN Conditioning",
      "sourceYaml": "../../standard_blocks/per-item-adaln-conditioning.yaml",
      "description": "Use a per-item conditioning stream to produce adaptive normalization shifts, scales, and gates for item updates.",
      "math": [
        {
          "id": "normalize_item",
          "text": "u_i = LayerNorm(x_i)",
          "tex": "u_i = \\operatorname{LN}(x_i)",
          "operation": "normalize"
        },
        {
          "id": "project_conditioning",
          "text": "shift_i, scale_i, gate_i = Linear(s_i)",
          "tex": "\\beta_i, \\gamma_i, g_i = W s_i",
          "operation": "conditioning_projection"
        },
        {
          "id": "modulate",
          "text": "y_i = gate_i * (scale_i * u_i + shift_i)",
          "tex": "y_i = g_i \\odot (\\gamma_i \\odot u_i + \\beta_i)",
          "operation": "adaptive_modulation"
        }
      ]
    }
  },
  "pseudocode": {
    "diffusion_transformer": {
      "sourceYaml": "../../pseudocode/diffusion-transformer.yaml",
      "symbols": [
        {
          "id": "input_latent",
          "name": "z",
          "architectureRef": "representations.input_latent"
        },
        {
          "id": "timestep",
          "name": "t",
          "architectureRef": "representations.timestep"
        },
        {
          "id": "class_label",
          "name": "y",
          "architectureRef": "representations.class_label"
        },
        {
          "id": "t_embedding",
          "name": "t_emb",
          "tex": "t_{\\mathrm{emb}}",
          "architectureRef": "representations.t_embedding"
        },
        {
          "id": "y_embedding",
          "name": "y_emb",
          "tex": "y_{\\mathrm{emb}}",
          "architectureRef": "representations.y_embedding"
        },
        {
          "id": "cond_vector",
          "name": "c",
          "architectureRef": "representations.cond_vector"
        },
        {
          "id": "token_state",
          "name": "x",
          "architectureRef": "representations.token_state"
        },
        {
          "id": "output_tokens",
          "name": "u",
          "architectureRef": "representations.output_tokens"
        },
        {
          "id": "noise_prediction",
          "name": "ε, Σ",
          "tex": "\\varepsilon_\\theta, \\Sigma_\\theta",
          "architectureRef": "representations.noise_prediction"
        }
      ],
      "lines": [
        {
          "id": "patchify_tokens",
          "text": "x = PatchEmbed(z) + pos_embed  # fixed 2D sin-cos",
          "refs": "DiT.forward",
          "architectureRefs": [
            "modules.patchify"
          ]
        },
        {
          "id": "embed_timestep",
          "text": "t_emb = MLP(SinCosEmbed_256(t))",
          "refs": "TimestepEmbedder",
          "architectureRefs": [
            "modules.timestep_embedder"
          ]
        },
        {
          "id": "embed_label",
          "text": "y_emb = Embedding(drop_to_null(y))  # label dropout for CFG",
          "refs": "LabelEmbedder",
          "architectureRefs": [
            "modules.label_embedder"
          ]
        },
        {
          "id": "combine_conditioning",
          "text": "c = t_emb + y_emb",
          "refs": "DiT.forward",
          "architectureRefs": [
            "modules.cond_combiner",
            "claims.conditioning_is_per_sample"
          ]
        },
        {
          "id": "run_blocks",
          "text": "for block in blocks: x = DiTBlock(x, c)  # adaLN-Zero, N blocks",
          "refs": "DiTBlock",
          "architectureRefs": [
            "modules.dit_blocks",
            "claims.adaln_zero_beats_alternatives"
          ],
          "standardBlockRef": "../../standard_blocks/adaln-zero-conditioning.yaml"
        },
        {
          "id": "decode_tokens",
          "text": "u = Linear(modulate(LayerNorm(x), MLP(c)))",
          "refs": "FinalLayer",
          "architectureRefs": [
            "modules.final_layer"
          ]
        },
        {
          "id": "unpatchify_output",
          "text": "eps, sigma = split(Unpatchify(u))",
          "refs": "DiT.unpatchify",
          "architectureRefs": [
            "modules.unpatchify"
          ]
        }
      ]
    }
  },
  "boards": {
    "sourceYaml": "../../views/dit-semantic-zoom.view.yaml",
    "rootBoard": "dit_overview",
    "items": [
      {
        "id": "dit_overview",
        "title": "Diffusion Transformer (DiT)",
        "summary": "A one-block overview. Open the backbone to see patch featurization, conditioning embedders, the adaLN-Zero block stack, and the token decoder. Featurization stages are elided into edges; hover an edge port to peek at them, click to pin.",
        "scale_lanes": false,
        "grid": {
          "columns": 3,
          "rows": 3
        },
        "nodes": [
          {
            "id": "dit_pipeline",
            "kind": "module",
            "label": "DiT denoising backbone",
            "scale": "abstract",
            "role": "class- and timestep-conditioned denoising over VAE latent patches",
            "detail": "patchify -> N x DiT blocks (adaLN-Zero) -> linear decode",
            "col": 2,
            "row": 2,
            "expandable": true
          }
        ]
      },
      {
        "id": "dit_pipeline",
        "title": "DiT Denoising Backbone",
        "summary": "The backbone patchifies the noised latent into tokens, builds one per-sample conditioning vector from timestep and class label, refines tokens with adaLN-Zero blocks, and decodes back to noise and covariance. Featurization modules are elided; their edges carry them.",
        "parent": "dit_overview",
        "scale_lanes": false,
        "grid": {
          "columns": 8,
          "rows": 5
        },
        "nodes": [
          {
            "id": "timestep",
            "kind": "representation",
            "rep_ref": "timestep",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 1
          },
          {
            "id": "class_label",
            "kind": "representation",
            "rep_ref": "class_label",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 2
          },
          {
            "id": "input_latent",
            "kind": "representation",
            "rep_ref": "input_latent",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 4
          },
          {
            "id": "timestep_embedder",
            "kind": "module",
            "module_ref": "timestep_embedder",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 1,
            "elide": true
          },
          {
            "id": "label_embedder",
            "kind": "module",
            "module_ref": "label_embedder",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 2,
            "elide": true
          },
          {
            "id": "t_embedding",
            "kind": "representation",
            "rep_ref": "t_embedding",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 1,
            "elide": true
          },
          {
            "id": "y_embedding",
            "kind": "representation",
            "rep_ref": "y_embedding",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 2,
            "elide": true
          },
          {
            "id": "cond_combiner",
            "kind": "module",
            "module_ref": "cond_combiner",
            "label": "t + y",
            "col": 3,
            "row": 1
          },
          {
            "id": "patchify",
            "kind": "module",
            "module_ref": "patchify",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 4,
            "elide": true
          },
          {
            "id": "cond_vector",
            "kind": "representation",
            "rep_ref": "cond_vector",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 1
          },
          {
            "id": "token_state",
            "kind": "representation",
            "rep_ref": "token_state",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 4
          },
          {
            "id": "dit_blocks",
            "kind": "module",
            "module_ref": "dit_blocks",
            "prominence": "primary",
            "treatment": "block",
            "col": 5,
            "row": 3,
            "expandable": true
          },
          {
            "id": "final_layer",
            "kind": "module",
            "module_ref": "final_layer",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 3
          },
          {
            "id": "output_tokens",
            "kind": "representation",
            "rep_ref": "output_tokens",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 4,
            "elide": true
          },
          {
            "id": "unpatchify",
            "kind": "module",
            "module_ref": "unpatchify",
            "treatment": "compact",
            "density": "compact",
            "col": 8,
            "row": 4,
            "elide": true
          },
          {
            "id": "noise_prediction",
            "kind": "representation",
            "rep_ref": "noise_prediction",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 8,
            "row": 3
          }
        ],
        "edges": [
          {
            "from": "timestep",
            "to": "timestep_embedder",
            "label": "t",
            "connection": {
              "title": "Timestep into embedder",
              "role": "noise-level featurization",
              "inside": "The scalar timestep is expanded with a 256-dim sinusoidal embedding and projected by a two-layer SiLU MLP."
            }
          },
          {
            "from": "timestep_embedder",
            "to": "t_embedding",
            "label": "t emb",
            "connection": {
              "title": "Embedded timestep",
              "role": "sample-scale embedding",
              "inside": "The MLP output is a per-sample vector at model width d."
            }
          },
          {
            "from": "class_label",
            "to": "label_embedder",
            "label": "y",
            "connection": {
              "title": "Label into embedder",
              "role": "class featurization",
              "inside": "The class index is looked up in an embedding table; during training labels randomly drop to a null class for classifier-free guidance."
            }
          },
          {
            "from": "label_embedder",
            "to": "y_embedding",
            "label": "y emb",
            "connection": {
              "title": "Embedded label",
              "role": "sample-scale embedding",
              "inside": "The lookup output is a per-sample vector at model width d."
            }
          },
          {
            "from": "t_embedding",
            "to": "cond_combiner",
            "label": "t emb",
            "connection": {
              "title": "Timestep embedding into combiner",
              "role": "additive combination",
              "inside": "Timestep and label embeddings are summed elementwise; no gating or concatenation."
            }
          },
          {
            "from": "y_embedding",
            "to": "cond_combiner",
            "label": "y emb",
            "connection": {
              "title": "Label embedding into combiner",
              "role": "additive combination",
              "inside": "Timestep and label embeddings are summed elementwise; no gating or concatenation."
            }
          },
          {
            "from": "cond_combiner",
            "to": "cond_vector",
            "label": "c",
            "tone": "conditioning",
            "connection": {
              "title": "Conditioning vector",
              "role": "read-only conditioning source",
              "inside": "The summed vector c = t_emb + y_emb is per-sample and is never updated by the block stack."
            }
          },
          {
            "from": "input_latent",
            "to": "patchify",
            "label": "latent",
            "connection": {
              "title": "Noised latent into patchify",
              "role": "patch featurization",
              "inside": "The spatial latent is cut into p x p patches, each linearly embedded into one token."
            }
          },
          {
            "from": "patchify",
            "to": "token_state",
            "label": "tokens + pos",
            "connection": {
              "title": "Token initialization",
              "role": "mutable token stream",
              "inside": "Patch tokens receive fixed 2D sin-cos positional embeddings; this is the only mutable state in the forward pass."
            }
          },
          {
            "from": "cond_vector",
            "to": "dit_blocks",
            "label": "c",
            "tone": "conditioning",
            "connection": {
              "title": "adaLN-Zero conditioning",
              "role": "per-sample modulation of every block",
              "inside": "Each block regresses shift, scale, and zero-initialized residual gates from c and applies them to its attention and MLP branches."
            }
          },
          {
            "from": "token_state",
            "to": "dit_blocks",
            "label": "x",
            "connection": {
              "title": "Tokens into the block stack",
              "role": "coarse mutable state",
              "inside": "Full self-attention over all patch tokens updates the token stream block by block."
            }
          },
          {
            "from": "dit_blocks",
            "to": "final_layer",
            "label": "refined tokens",
            "connection": {
              "title": "Refined tokens to decoder",
              "role": "token decoding",
              "inside": "The final layer normalizes tokens with adaLN-modulated LayerNorm before the linear decode."
            }
          },
          {
            "from": "cond_vector",
            "to": "final_layer",
            "label": "c",
            "tone": "conditioning",
            "connection": {
              "title": "Final-layer adaLN",
              "role": "shift/scale modulation",
              "inside": "The final layer regresses shift and scale (no gate) from c before decoding."
            }
          },
          {
            "from": "final_layer",
            "to": "output_tokens",
            "label": "p*p*2C per token",
            "connection": {
              "title": "Linear decode",
              "role": "per-token patch prediction",
              "inside": "Each token is decoded to a p x p patch of predicted noise and covariance channels."
            }
          },
          {
            "from": "output_tokens",
            "to": "unpatchify",
            "label": "reshape",
            "connection": {
              "title": "Tokens into unpatchify",
              "role": "layout restoration",
              "inside": "Per-token patch predictions are rearranged back to the spatial latent grid; this is a lossless reshape."
            }
          },
          {
            "from": "unpatchify",
            "to": "noise_prediction",
            "label": "eps, sigma",
            "connection": {
              "title": "Noise and covariance prediction",
              "role": "final outputs",
              "inside": "The output splits channelwise into the predicted noise epsilon and covariance Sigma."
            }
          }
        ],
        "open_notes": [
          "Featurization (patchify, embedders, combiner) and output reshaping are elided; the contracted edges carry them."
        ]
      },
      {
        "id": "dit_blocks",
        "title": "DiT Block (adaLN-Zero)",
        "summary": "One block of the stack. A per-sample MLP on c emits six vectors: shift1, scale1, gate1 for the attention branch and shift2, scale2, gate2 for the MLP branch. Each branch is normalized, shifted/scaled, transformed, gated, then added back residually.",
        "parent": "dit_pipeline",
        "scale_lanes": false,
        "grid": {
          "columns": 12,
          "rows": 4,
          "min_col": 88,
          "col_gap": 14
        },
        "nodes": [
          {
            "id": "token_state_in",
            "kind": "representation",
            "rep_ref": "token_state",
            "label": "tokens in",
            "col": 1,
            "row": 4
          },
          {
            "id": "cond_vector",
            "kind": "representation",
            "rep_ref": "cond_vector",
            "col": 2,
            "row": 1
          },
          {
            "id": "adaln_mlp",
            "kind": "operation",
            "label": "adaLN MLP",
            "scale": "sample",
            "treatment": "compact",
            "density": "compact",
            "role": "apply SiLU then a linear projection from c to six modulation vectors",
            "detail": "c -> shift1, scale1, gate1, shift2, scale2, gate2",
            "col": 4,
            "row": 1
          },
          {
            "id": "attn_params",
            "kind": "operation",
            "label": "branch-1 params",
            "scale": "sample",
            "treatment": "chip",
            "density": "micro",
            "role": "shift1, scale1, and gate1 modulate the attention residual branch",
            "col": 3,
            "row": 2
          },
          {
            "id": "mlp_params",
            "kind": "operation",
            "label": "branch-2 params",
            "scale": "sample",
            "treatment": "chip",
            "density": "micro",
            "role": "shift2, scale2, and gate2 modulate the pointwise MLP residual branch",
            "col": 8,
            "row": 2
          },
          {
            "id": "norm1",
            "kind": "operation",
            "label": "LayerNorm",
            "scale": "token",
            "treatment": "chip",
            "density": "micro",
            "role": "normalize tokens before the attention branch; no learned affine",
            "col": 2,
            "row": 4
          },
          {
            "id": "adaln_mod",
            "kind": "operation",
            "label": "shift/scale 1",
            "scale": "token",
            "treatment": "chip",
            "density": "micro",
            "role": "affine modulation",
            "detail": "norm1 -> scale1, shift1",
            "col": 3,
            "row": 4
          },
          {
            "id": "self_attention",
            "kind": "module",
            "label": "self-attention",
            "scale": "token",
            "treatment": "compact",
            "density": "compact",
            "role": "16-head full self-attention inside one DiT-XL block",
            "detail": "standard QKV attention plus output projection",
            "col": 4,
            "row": 4
          },
          {
            "id": "gate1",
            "kind": "operation",
            "operator": "*",
            "label": "gate1",
            "scale": "token",
            "role": "multiply the attention output by the zero-initialized gate1 vector",
            "col": 5,
            "row": 4
          },
          {
            "id": "add1",
            "kind": "operation",
            "operator": "+",
            "label": "residual add 1",
            "scale": "token",
            "role": "add the gated attention branch back to the incoming token state",
            "col": 6,
            "row": 4
          },
          {
            "id": "norm2",
            "kind": "operation",
            "label": "LayerNorm",
            "scale": "token",
            "treatment": "chip",
            "density": "micro",
            "role": "normalize the post-attention token state before the MLP branch",
            "col": 7,
            "row": 4
          },
          {
            "id": "scale_shift2",
            "kind": "operation",
            "label": "shift/scale 2",
            "scale": "token",
            "treatment": "chip",
            "density": "micro",
            "role": "affine modulation",
            "detail": "norm2 -> scale2, shift2",
            "col": 8,
            "row": 4
          },
          {
            "id": "mlp_branch",
            "kind": "operation",
            "label": "pointwise MLP branch",
            "scale": "token",
            "treatment": "compact",
            "density": "compact",
            "role": "transform each token independently with the DiT MLP branch",
            "col": 9,
            "row": 4
          },
          {
            "id": "gate2",
            "kind": "operation",
            "operator": "*",
            "label": "gate2",
            "scale": "token",
            "role": "multiply the MLP output by the zero-initialized gate2 vector",
            "col": 10,
            "row": 4
          },
          {
            "id": "add2",
            "kind": "operation",
            "operator": "+",
            "label": "residual add 2",
            "scale": "token",
            "role": "add the gated MLP branch back to the post-attention token state",
            "col": 11,
            "row": 4
          },
          {
            "id": "token_state_out",
            "kind": "representation",
            "rep_ref": "token_state",
            "label": "tokens out",
            "col": 12,
            "row": 4
          }
        ],
        "edges": [
          {
            "from": "cond_vector",
            "to": "adaln_mlp",
            "label": "c",
            "tone": "conditioning",
            "connection": {
              "title": "Conditioning into adaLN MLP",
              "role": "modulation source",
              "inside": "The per-sample conditioning vector c is passed through SiLU and a linear layer to produce six vectors for the two residual branches."
            }
          },
          {
            "from": "adaln_mlp",
            "to": "attn_params",
            "label": "1st branch",
            "tone": "conditioning",
            "connection": {
              "title": "Attention-branch parameters",
              "role": "adaLN-Zero branch controls",
              "inside": "The first three chunks are shift1, scale1, and gate1; they modulate and gate the self-attention branch."
            }
          },
          {
            "from": "adaln_mlp",
            "to": "mlp_params",
            "label": "2nd branch",
            "tone": "conditioning",
            "connection": {
              "title": "MLP-branch parameters",
              "role": "adaLN-Zero branch controls",
              "inside": "The last three chunks are shift2, scale2, and gate2; they modulate and gate the pointwise MLP branch."
            }
          },
          {
            "from": "token_state_in",
            "to": "norm1",
            "label": "x",
            "connection": {
              "title": "Tokens into first LayerNorm",
              "role": "branch input",
              "inside": "The incoming token state is first LayerNorm-normalized for the attention residual branch."
            }
          },
          {
            "from": "norm1",
            "to": "adaln_mod",
            "label": "norm1",
            "connection": {
              "title": "Normalized tokens",
              "role": "normalized branch input",
              "inside": "DiT uses LayerNorm without learned affine parameters before applying adaptive shift and scale from c."
            }
          },
          {
            "from": "attn_params",
            "to": "adaln_mod",
            "label": "shift1, scale1",
            "tone": "conditioning",
            "connection": {
              "title": "First adaLN shift and scale",
              "role": "attention-branch modulation",
              "inside": "shift1 and scale1 are broadcast over tokens and applied to the normalized token stream before self-attention."
            }
          },
          {
            "from": "adaln_mod",
            "to": "self_attention",
            "label": "modulated x",
            "connection": {
              "title": "Modulated tokens into attention",
              "role": "attention input",
              "inside": "The shifted and scaled token stream enters full multi-head self-attention."
            }
          },
          {
            "from": "self_attention",
            "to": "gate1",
            "label": "attn",
            "connection": {
              "title": "Attention branch output",
              "role": "residual branch value",
              "inside": "The attention branch output is not added directly; it is first multiplied by gate1."
            }
          },
          {
            "from": "attn_params",
            "to": "gate1",
            "label": "gate1",
            "tone": "conditioning",
            "connection": {
              "title": "First residual gate",
              "role": "zero-initialized branch gate",
              "inside": "gate1 is one of the six vectors from the adaLN MLP. It starts at zero initialization, so the attention branch initially contributes nothing."
            }
          },
          {
            "from": "gate1",
            "to": "add1",
            "label": "gate1*attn",
            "connection": {
              "title": "Gated attention update",
              "role": "gated residual update",
              "inside": "The gated attention output is the update term for the first residual add."
            }
          },
          {
            "from": "token_state_in",
            "to": "add1",
            "label": "skip x",
            "tone": "skip",
            "connection": {
              "title": "First residual skip",
              "role": "residual identity path",
              "inside": "The original token state bypasses the attention branch and is added to the gated attention update."
            }
          },
          {
            "from": "add1",
            "to": "norm2",
            "label": "x1",
            "connection": {
              "title": "Post-attention state",
              "role": "second branch input",
              "inside": "The output of the first residual add becomes the input to the MLP residual branch."
            }
          },
          {
            "from": "norm2",
            "to": "scale_shift2",
            "label": "norm2",
            "connection": {
              "title": "Normalized post-attention tokens",
              "role": "normalized branch input",
              "inside": "The post-attention token state is LayerNorm-normalized before the second adaptive shift and scale."
            }
          },
          {
            "from": "mlp_params",
            "to": "scale_shift2",
            "label": "shift2, scale2",
            "tone": "conditioning",
            "connection": {
              "title": "Second adaLN shift and scale",
              "role": "MLP-branch modulation",
              "inside": "shift2 and scale2 are broadcast over tokens and applied before the pointwise MLP branch."
            }
          },
          {
            "from": "scale_shift2",
            "to": "mlp_branch",
            "label": "modulated x1",
            "connection": {
              "title": "Modulated tokens into MLP",
              "role": "MLP input",
              "inside": "The second shifted and scaled token stream enters the pointwise feed-forward branch."
            }
          },
          {
            "from": "mlp_branch",
            "to": "gate2",
            "label": "mlp",
            "connection": {
              "title": "MLP branch output",
              "role": "residual branch value",
              "inside": "The pointwise MLP output is multiplied by gate2 before the second residual add."
            }
          },
          {
            "from": "mlp_params",
            "to": "gate2",
            "label": "gate2",
            "tone": "conditioning",
            "connection": {
              "title": "Second residual gate",
              "role": "zero-initialized branch gate",
              "inside": "gate2 starts at zero initialization, so the MLP branch initially contributes nothing."
            }
          },
          {
            "from": "gate2",
            "to": "add2",
            "label": "gate2*mlp",
            "connection": {
              "title": "Gated MLP update",
              "role": "gated residual update",
              "inside": "The gated MLP output is the update term for the second residual add."
            }
          },
          {
            "from": "add1",
            "to": "add2",
            "label": "skip x1",
            "tone": "skip",
            "connection": {
              "title": "Second residual skip",
              "role": "residual identity path",
              "inside": "The post-attention state bypasses the MLP branch and is added to the gated MLP update."
            }
          },
          {
            "from": "add2",
            "to": "token_state_out",
            "label": "x out",
            "connection": {
              "title": "Updated tokens",
              "role": "mutable output",
              "inside": "The block returns tokens with the same shape and ownership; at initialization both gates are zero, so the whole block starts as an identity map."
            }
          }
        ]
      }
    ]
  }
};
